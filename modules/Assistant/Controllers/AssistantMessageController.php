<?php declare(strict_types=1);
namespace Modules\Assistant\Controllers;

use Modules\Assistant\Auth\Policies\AssistantMessagePolicy;
use Modules\Assistant\Models\AssistantMessage;
use Modules\Assistant\Services\AssistantService;
use Proto\Http\Loop\UpdateEvent;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * AssistantMessageController
 *
 * @package Modules\Assistant\Controllers
 */
class AssistantMessageController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = AssistantMessagePolicy::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = AssistantMessage::class
	)
	{
		parent::__construct();
	}

	/**
	 * Send a new message and stream AI response.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		$conversationId = (int)($request->params()->conversationId ?? $data->conversationId ?? null);
		$userId = session()->user->id ?? null;

		if (!$conversationId || !$userId)
		{
			return $this->error('Conversation ID and user ID required', 400);
		}

		$content = $data->content ?? '';
		if (empty(trim($content)))
		{
			return $this->error('Message content required', 400);
		}

		// Stream the AI response via SSE
		$assistantService = new AssistantService();
		$assistantService->streamResponse($conversationId, $userId, $content);

		return $this->response(['success' => true]);
	}

	/**
	 * Modifies the filter object based on the request.
	 *
	 * @param mixed $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		$conversationId = $request->params()->conversationId ?? null;
		if (isset($conversationId))
		{
			$filter->{'am.conversation_id'} = $conversationId;
		}

		// Only show messages for the authenticated user's conversations
		$userId = session()->user->id ?? null;
		if ($userId)
		{
			$filter->{'am.user_id'} = $userId;
		}

		// Support "since" parameter for fetching newer messages
		$since = $request->getInt('since');
		if ($since)
		{
			$filter->{'am.id'} = ['>', $since];
		}

		return $filter;
	}

    /**
     * This will generate a reply.
     *
     * @param Request $request
     * @return void
     */
    public function generate(Request $request): void
    {
        $chatId = $request->getInt('chatId');
        if (!isset($chatId))
        {
            return;
        }

        eventStream(function(UpdateEvent $event) use ($chatId)
        {
            $responses = explode("\n\ndata:", $data);
            foreach ($responses as $response)
            {
                $clean = preg_replace("/^data: |\\n\\n$/", "", $response);
                if (strpos($clean, "[DONE]") !== false)
                {
                    $result = ChatGptHistoryController::getLastId($chatId);
                    if (empty($result->row))
                    {
                        return;
                    }

                    $controller = new ChatGptHistoryController();
                    $controller->updateAi($result->row->id, $text);
                    return;
                }

                $result = Json::decode($clean);
                if (isset($result->choices[0]->delta->content))
                {
                    $text .= $result->choices[0]->delta->content;
                }
            }
        });
    }

	/**
	 * Sync messages for a conversation via Redis-based SSE.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return;
		}

		// Subscribe to conversation's message updates channel
		$channel = "assistant_conversation:{$conversationId}:messages";
		redisEvent($channel, function($channel, $message): array|null
		{
			// Message contains message ID from Redis publish
			$messageId = $message['id'] ?? $message['messageId'] ?? null;
			if (!$messageId)
			{
				return null;
			}

			$action = $message['action'] ?? 'merge';
			if ($action === 'delete')
			{
				return [
					'merge' => [],
					'deleted' => [$messageId]
				];
			}

			// Fetch the updated message data
			$messageData = AssistantMessage::get($messageId);
			if (!$messageData)
			{
				return null;
			}

			return [
				'merge' => [$messageData],
				'deleted' => []
			];
		});
	}

	/**
	 * Validation rules
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'conversationId' => 'int|required',
			'content' => 'string|required'
		];
	}
}

<?php declare(strict_types=1);
namespace Modules\Client\Controllers\Conversation;

use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Client\Models\Conversation\ClientConversation;
use Modules\Client\Services\Conversation\ConversationAttachmentService;
use Modules\Client\Auth\Policies\ClientResourcePolicy;

/**
 * ClientConversationController
 *
 * @package Modules\Client\Controllers\Conversation
 */
class ClientConversationController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 * @param ConversationAttachmentService $service The attachment service.
	 */
	public function __construct(
		protected ?string $model = ClientConversation::class,
		protected ConversationAttachmentService $service = new ConversationAttachmentService()
	)
	{
		parent::__construct();
	}

	/**
	 * This will set up the validation rules.
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'clientId' => 'int|required',
			'userId' => 'int|required',
			'message' => 'string:5000|required',
			'isInternal' => 'int',
			'isPinned' => 'int',
			'messageType' => 'string:50',
			'parentId' => 'int'
		];
	}

	/**
	 * Modifies the data before adding.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifiyAddItem(object &$data, Request $request): void
	{
		// Decode HTML entities and URL encoding from the message
		if (isset($data->message))
		{
			$data->message = trim(html_entity_decode($data->message, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
		}
	}

	/**
	 * Override the add method to handle file attachments.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation and attachments.
	 */
	public function add(Request $request): object
	{
		$result = parent::add($request);
		if ($result->success === false)
		{
			return $result;
		}

		return $this->uploadAttachments($request, $result);
	}

	/**
	 * Upload attachments for a conversation.
	 *
	 * @param Request $request The HTTP request object.
	 * @param object $response The existing response object.
	 * @return object
	 */
	protected function uploadAttachments(Request $request, object $response): object
	{
		$conversationId = (int)$response->id;
		$clientId = (int)($request->params()->clientId ?? null);

		// Check if files were uploaded using Request method
		$attachments = $request->fileArray('attachments');
		if (!empty($attachments))
		{
			$userId = getSession('user')->id ?? null;
			$response = $this->service->handleAttachments($request, $conversationId, $userId);
		}

		// Publish Redis event to notify all watchers of this client's conversation
		// Do this AFTER attachments are processed so the full record is available
		if ($clientId && $conversationId)
		{
			$this->publishConversationUpdate($clientId, $conversationId, 'merge');
		}
		return $response;
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
		$clientId = $request->params()->clientId ?? null;
		if (isset($clientId))
		{
			$filter->{'co.client_id'} = $clientId;
			unset($filter->clientId);
		}

		// Support "since" parameter for fetching newer conversations
		$since = $request->getInt('since');
		if ($since)
		{
			$filter->{'co.id'} = ['>', $since];
		}

		return $filter;
	}

	/**
	 * Stream conversation updates via Redis-based Server-Sent Events.
	 * Listens to conversation updates published via Redis pub/sub.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$clientId = (int)($request->params()->clientId ?? null);
		if (!$clientId)
		{
			return;
		}

		// Subscribe to client's conversation updates channel
		$channel = "client:{$clientId}:conversations";
		redisEvent($channel, function($channel, $message) use ($clientId)
		{
			// Message contains conversation ID from Redis publish
			$conversationId = (int)($message['id'] ?? $message['conversationId'] ?? null);
			if (!$conversationId)
			{
				return null;
			}

			// Fetch the updated conversation data with all joins
			$conversation = ClientConversation::get($conversationId);
			if (!$conversation)
			{
				return null;
			}

			// Determine action type from message
			$action = $message['action'] ?? 'merge';

			return [
				'merge' => $action === 'merge' ? [$conversation] : [],
				'deleted' => $action === 'delete' ? [$conversationId] : []
			];
		});
	}

	/**
	 * Publish Redis event for conversation updates.
	 *
	 * @param int $clientId
	 * @param int $conversationId
	 * @param string $action
	 * @return void
	 */
	protected function publishConversationUpdate(int $clientId, int $conversationId, string $action = 'merge'): void
	{
		// Emit with redis: prefix - the framework strips it for the actual Redis channel
		events()->emit("redis:client:{$clientId}:conversations", [
			'id' => (int)$conversationId,
			'conversationId' => (int)$conversationId,
			'action' => $action
		]);
	}
}
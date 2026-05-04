<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Proto\Controllers\Traits\SyncableTrait;
use Proto\Http\Router\Request;
use Modules\Client\Conversation\Models\ClientConversation;
use Modules\Client\Conversation\Services\ConversationAttachmentService;
use Modules\Client\Auth\Policies\ClientResourcePolicy;
use Proto\Utils\Strings;

/**
 * ClientConversationController
 *
 * @package Modules\Client\Conversation\Controllers
 */
class ClientConversationController extends Controller
{
	use SyncableTrait;

	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * @var string|null $serviceClass
	 */
	protected ?string $serviceClass = ConversationAttachmentService::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = ClientConversation::class)
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
	protected function modifyAddItem(object &$data, Request $request): void
	{
		// Decode HTML entities and URL encoding from the message
		if (isset($data->message))
		{
			$data->message = Strings::prepareContent($data->message);
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
	 * Get the Redis channel for conversation sync.
	 *
	 * @param Request $request
	 * @return string
	 */
	protected function getSyncChannel(Request $request): string
	{
		$clientId = (int)($request->params()->clientId ?? 0);
		return "client:{$clientId}:conversations";
	}

	/**
	 * Handle incoming sync message for conversations.
	 *
	 * @param string $channel
	 * @param array $message
	 * @param Request $request
	 * @return array|null
	 */
	protected function handleSyncMessage(string $channel, array $message, Request $request): array|null|false
	{
		$conversationId = (int)($message['id'] ?? $message['conversationId'] ?? null);
		if (!$conversationId)
		{
			return null;
		}

		$conversation = ClientConversation::get($conversationId);
		if (!$conversation)
		{
			return null;
		}

		$action = $message['action'] ?? 'merge';
		return [
			'merge' => $action === 'merge' ? [$conversation] : [],
			'deleted' => $action === 'delete' ? [$conversationId] : []
		];
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

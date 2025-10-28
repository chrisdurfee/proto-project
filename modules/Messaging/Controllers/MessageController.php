<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Message;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * MessageController
 *
 * @package Modules\Messaging\Controllers
 */
class MessageController extends ResourceController
{
	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = Message::class
	)
	{
		parent::__construct();
	}

	/**
	 * Get messages for a conversation.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function index(Request $request): object
	{
		$conversationId = $request->getInt('conversationId');
		$limit = ($request->getInt('limit') ?? 50);
		$offset = ($request->getInt('offset') ?? 0);

		if (!$conversationId)
		{
			return $this->error('Conversation ID required', 400);
		}

		$messages = Message::getForConversation($conversationId, $limit, $offset);

		return $this->response($messages);
	}

	/**
	 * Send a new message.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function store(Request $request): object
	{
		$userId = getSession('user')->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		// Basic validation
		if (empty($data['conversationId']) || empty($data['content'])) {
			return $this->error('Conversation ID and content are required', 400);
		}

		// Set sender and defaults
		$data = $this->getRequestItem($request);
		$data->senderId = $userId;
		$data->messageType = $data->messageType ?? 'text';
		$data->createdAt = date('Y-m-d H:i:s');
		$data->updatedAt = date('Y-m-d H:i:s');

		// Use ResourceController's built-in add method
		$result = $this->addItem((object)$data);

		return $result;
	}

	/**
	 * Mark messages as read.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function markAsRead(Request $request): object
	{
		$conversationId = $request->getInt('conversationId');
		$userId = getSession('user')->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		if (!$conversationId) {
			return $this->error('Conversation ID required', 400);
		}

		$result = Message::markAsRead($conversationId, $userId);

		return $this->response([
			'success' => $result,
			'message' => $result ? 'Messages marked as read' : 'Failed to mark messages as read'
		]);
	}

	/**
	 * Validation rules
	 */
	protected function validate(): array
	{
		return [
			'conversationId' => 'int|required',
			'content' => 'string|required',
			'messageType' => 'string:20',
			'fileUrl' => 'string:500',
			'fileName' => 'string:255'
		];
	}
}
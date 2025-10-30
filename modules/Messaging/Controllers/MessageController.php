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
	 * Send a new message.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function add(Request $request): object
	{
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$data = $this->getRequestItem($request);
		$conversationId = $request->params()->conversationId ?? null;
		if (empty($conversationId) || empty($data->content))
		{
			return $this->error('Conversation ID and content are required', 400);
		}

		// Set sender and defaults
		$data->senderId = $userId;
		$data->messageType = $data->messageType ?? 'text';
		$data->conversationId = $conversationId;

		return $this->addItem($data);
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
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		if (!$conversationId)
		{
			return $this->error('Conversation ID required', 400);
		}

		$result = Message::markAsRead($conversationId, $userId);

		return $this->response([
			'success' => $result,
			'message' => $result ? 'Messages marked as read' : 'Failed to mark messages as read'
		]);
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
			$filter->conversationId = $conversationId;
		}

		return $filter;
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
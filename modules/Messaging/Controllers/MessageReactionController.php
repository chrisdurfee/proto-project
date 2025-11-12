<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Modules\Messaging\Auth\Policies\MessageReactionPolicy;
use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\MessageReaction;
use Modules\Messaging\Models\Message;

/**
 * MessageReactionController
 *
 * @package Modules\Messaging\Controllers
 */
class MessageReactionController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = MessageReactionPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = MessageReaction::class)
	{
		parent::__construct();
	}

	/**
	 * Toggle a reaction (add if doesn't exist, remove if exists).
	 *
	 * @param Request $request
	 * @return object
	 */
	public function toggle(Request $request): object
	{
		$messageId = (int)($request->params()->messageId ?? null);
		$data = $this->getRequestItem($request);

		if (!$messageId || !isset($data->emoji))
		{
			return $this->error('Message ID and emoji are required', 400);
		}

		$userId = session()->user->id ?? null;
		$existing = $this->findExistingReaction($messageId, $userId, $data->emoji);
		if ($existing)
		{
			return $this->removeReaction($existing, $messageId);
		}

		return $this->addReaction($messageId, $userId, $data->emoji);
	}

	/**
	 * Find an existing reaction.
	 *
	 * @param int $messageId
	 * @param int $userId
	 * @param string $emoji
	 * @return object|null
	 */
	protected function findExistingReaction(int $messageId, int $userId, string $emoji): ?object
	{
		return MessageReaction::getBy([
			'messageId' => $messageId,
			'userId' => $userId,
			'emoji' => $emoji
		]);
	}

	/**
	 * Remove a reaction and update the message timestamp.
	 *
	 * @param object $reaction
	 * @param int $messageId
	 * @return object
	 */
	protected function removeReaction(object $reaction, int $messageId): object
	{
		$deleteResult = $this->deleteItem((object)['id' => $reaction->id]);
		$success = $deleteResult->success ?? false;
		if ($success)
		{
			$this->touchAndNotifyMessage($messageId);
		}

		return $this->response([
			'success' => $success,
			'action' => 'removed',
			'message' => $success ? 'Reaction removed' : 'Failed to remove reaction',
			'messageId' => $messageId,
			'reactionId' => $reaction->id
		]);
	}

	/**
	 * Touch conversation to update timestamp and notify all participants.
	 *
	 * @param int $messageId
	 * @return void
	 */
	protected function touchAndNotifyMessage(int $messageId): void
	{
		Message::touch($messageId);

		// Notify all participants about the update
		$this->notifyMessageUpdate($messageId);
	}

	/**
	 * Notify all conversation participants about an update.
	 *
	 * @param int $conversationId
	 * @return void
	 */
	protected function notifyMessageUpdate(int $messageId): void
	{
		$message = Message::get($messageId);
		if (!$message)
		{
			return;
		}

		events()->emit("redis:conversation:{$message->conversationId}:messages", [
			'id' => $messageId,
			'action' => 'merge'
		]);
	}

	/**
	 * Add a reaction and update the message timestamp.
	 *
	 * @param int $messageId
	 * @param int $userId
	 * @param string $emoji
	 * @return object
	 */
	protected function addReaction(int $messageId, int $userId, string $emoji): object
	{
		$result = $this->addItem((object)[
			'messageId' => $messageId,
			'userId' => $userId,
			'emoji' => $emoji
		]);

		$success = $result !== false;
		if ($success)
		{
			$this->touchAndNotifyMessage($messageId);
		}

		return $this->response([
			'success' => $success,
			'action' => 'added',
			'message' => $success ? 'Reaction added' : 'Failed to add reaction',
			'messageId' => $messageId,
			'reactionId' => is_object($result) ? $result->id : null
		]);
	}

	/**
	 * Get all reactions for a message.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function all(Request $request): object
	{
		$messageId = $request->params()->messageId ?? null;
		if (!$messageId)
		{
			return $this->error('Message ID required', 400);
		}

		$reactions = MessageReaction::fetchWhere(['messageId' => $messageId]) ?? [];

		// Group reactions by emoji
		$grouped = [];
		foreach ($reactions as $reaction)
		{
			if (!isset($grouped[$reaction->emoji]))
			{
				$grouped[$reaction->emoji] = [
					'emoji' => $reaction->emoji,
					'count' => 0,
					'users' => []
				];
			}
			$grouped[$reaction->emoji]['count']++;
			$grouped[$reaction->emoji]['users'][] = $reaction->userId;
		}

		return $this->response([
			'rows' => array_values($grouped),
			'count' => count($grouped)
		]);
	}

	/**
	 * Validation rules
	 */
	protected function validate(): array
	{
		return [
			'emoji' => 'string:50|required'
		];
	}
}
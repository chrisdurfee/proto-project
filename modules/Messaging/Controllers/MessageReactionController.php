<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\MessageReaction;

/**
 * MessageReactionController
 *
 * @package Modules\Messaging\Controllers
 */
class MessageReactionController extends Controller
{
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
		$userId = session()->user->id ?? null;
		if (!$userId)
		{
			return $this->error('Unauthorized', 401);
		}

		$messageId = $request->params()->messageId ?? null;
		$data = $this->getRequestItem($request);

		if (!$messageId || !isset($data->emoji))
		{
			return $this->error('Message ID and emoji are required', 400);
		}

		// Check if reaction exists
		$existing = MessageReaction::getBy([
			'messageId' => $messageId,
			'userId' => $userId,
			'emoji' => $data->emoji
		]);

		if ($existing)
		{
			// Remove reaction
			MessageReaction::deleteById((object)['id' => $existing->id]);
			return $this->response([
				'success' => true,
				'action' => 'removed',
				'message' => 'Reaction removed'
			]);
		}

		// Add reaction
		$result = MessageReaction::create((object)[
			'messageId' => $messageId,
			'userId' => $userId,
			'emoji' => $data->emoji
		]);

		return $this->response([
			'success' => $result !== false,
			'action' => 'added',
			'message' => $result ? 'Reaction added' : 'Failed to add reaction'
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
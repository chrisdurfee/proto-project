<?php declare(strict_types=1);
namespace Modules\Tracking\Activity\Controllers;

use Modules\Tracking\Activity\Auth\Policies\ActivityPolicy;
use Proto\Controllers\ResourceController as Controller;
use Proto\Controllers\Traits\SyncableTrait;
use Modules\Tracking\Activity\Models\Activity;
use Proto\Http\Router\Request;

/**
 * ActivityController
 *
 * @package Modules\Tracking\Activity\Controllers
 */
class ActivityController extends Controller
{
	use SyncableTrait;

	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ActivityPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = Activity::class)
	{
		parent::__construct();
	}

	/**
	 * Gets model data by type.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function getByType(Request $request): object
	{
		$type = $request->input('type');
        $refId = $request->getInt('refId');
		if (empty($type) || !isset($refId))
		{
			return $this->error('No item provided.');
		}

		return $this->response([
			'rows' => $this->model()->getByType($type, $refId)
		]);
	}

	/**
	 * Adds a user to an activity resource.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function add(Request $request): object
	{
		$data = $this->getRequestItem($request);
		$result = parent::add($request);

		if ($result->success && isset($data->type) && isset($data->refId))
		{
			// Publish Redis event to notify all watchers of this resource
			$this->publishActivityUpdate($data->type, $data->refId, 'merge');
		}

		return $result;
	}

	/**
	 * Deletes model data.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function deleteUserByType(Request $request): object
	{
		$type = $request->input('type');
        $refId = $request->getInt('refId');
        $userId = $request->getInt('userId');
		if (empty($type) || !isset($refId) || !isset($userId))
		{
			return $this->error('No item provided.');
		}

		$result = $this->model()->deleteUserByType($type, $refId, $userId);

		// Publish Redis event to notify all watchers that a user left
		if ($result)
		{
			$this->publishActivityUpdate($type, $refId, 'merge');
		}

		return $this->response($result);
	}

	/**
	 * Get the Redis channel for activity sync.
	 *
	 * @param Request $request
	 * @return string
	 */
	protected function getSyncChannel(Request $request): string
	{
		$type = $request->input('type');
		$refId = $request->getInt('refId');
		return "activity:{$type}:{$refId}";
	}

	/**
	 * Handle incoming sync message for activity updates.
	 *
	 * @param string $channel
	 * @param array $message
	 * @param Request $request
	 * @return array|null|false
	 */
	protected function handleSyncMessage(string $channel, array $message, Request $request): array|null|false
	{
		$type = $request->input('type');
		$refId = $request->getInt('refId');
		if (empty($type) || !isset($refId))
		{
			return null;
		}

		$activities = Activity::getByType($type, $refId);
		$action = $message['action'] ?? 'merge';

		return [
			'rows' => $activities,
			'action' => $action
		];
	}

	/**
	 * Publish Redis event for activity updates.
	 *
	 * @param string $type
	 * @param int $refId
	 * @param string $action
	 * @return void
	 */
	protected function publishActivityUpdate(string $type, int $refId, string $action = 'merge'): void
	{
		events()->emit("redis:activity:{$type}:{$refId}", [
			'type' => $type,
			'refId' => $refId,
			'action' => $action
		]);
	}
}

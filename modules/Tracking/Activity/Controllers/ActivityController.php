<?php declare(strict_types=1);
namespace Modules\Tracking\Activity\Controllers;

use Modules\Tracking\Activity\Auth\Policies\ActivityPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Tracking\Activity\Models\Activity;
use Proto\Http\Router\Request;

/**
 * ActivityController
 *
 * @package Modules\Tracking\Activity\Controllers
 */
class ActivityController extends Controller
{
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
	 * Stream activity updates via Redis-based Server-Sent Events.
	 * Listens to activity updates published via Redis pub/sub.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function sync(Request $request): void
	{
		$type = $request->input('type');
		$refId = $request->getInt('refId');

		if (empty($type) || !isset($refId))
		{
			return;
		}

		// Subscribe to resource activity updates channel
		$channel = "activity:{$type}:{$refId}";
		redisEvent($channel, function($channel, $message) use ($type, $refId)
		{
			// Fetch the updated activity list
			$activities = Activity::getByType($type, $refId);

			// Determine action type from message
			$action = $message['action'] ?? 'merge';

			return [
				'rows' => $activities,
				'action' => $action
			];
		});
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

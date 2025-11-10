<?php declare(strict_types=1);
namespace Modules\User\Controllers;

use Modules\User\Auth\Policies\FollowerPolicy;
use Proto\Controllers\ApiController as Controller;
use Modules\User\Services\User\FollowerService;
use Proto\Http\Router\Request;
use Modules\User\Models\User;

/**
 * FollowerController
 *
 * @package Modules\User\Controllers
 */
class FollowerController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = FollowerPolicy::class;

	/**
	 * FollowerController constructor.
	 *
	 * @param FollowerService $followerService
	 * @return void
	 */
	public function __construct(
		protected FollowerService $followerService = new FollowerService()
	)
	{
	}

	/**
	 * Notify a user about a new follower.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function notify(Request $request): object
	{
		$followerId = $request->params()->followerId ?? null;
		if (!isset($followerId))
		{
			return $this->error('Follower user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID to follow.');
		}

		$queue = $request->input('queue');
		$result = $this->followerService->notifyNewFollower((int)$userId, (int)$followerId, (bool)$queue);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Toggles the follower status.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function toggle(Request $request): object
	{
		$followerId = $request->params()->followerId ?? null;
		if (!isset($followerId))
		{
			return $this->error('Follower user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID to follow.');
		}

		if ($followerId == $userId)
		{
			return $this->error('Follower user ID cannot be the same as the user ID.');
		}

		$result = $this->followerService->toggleFollower((int)$userId, (int)$followerId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Adds a follower.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function follow(Request $request): object
	{
		$followerId = $request->params()->followerId ?? null;
		if (!isset($followerId))
		{
			return $this->error('Follower user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID to follow.');
		}

		if ($followerId == $userId)
		{
			return $this->error('Follower user ID cannot be the same as the user ID.');
		}

		$result = $this->followerService->followUser((int)$userId, (int)$followerId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Removes a follower.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function unfollow(Request $request): object
	{
		$followerId = $request->params()->followerId ?? null;
		if (!isset($followerId))
		{
			return $this->error('Follower user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID to unfollow.');
		}

		$result = $this->followerService->unfollowUser((int)$userId, (int)$followerId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Retrieve all records.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function all(Request $request): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$user = User::get($userId);
		if ($user === null)
		{
			return $this->error('User not found.');
		}

		$inputs = $this->getAllInputs($request);
		$result = $user->followers()->all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
		return $this->response($result);
	}
}
<?php declare(strict_types=1);
namespace Modules\User\Services\User;

use Modules\User\Models\User;
use Modules\User\Models\FollowerUser;
use Modules\User\Push\NewFollowerPush;
use Proto\Controllers\Response;

/**
 * FollowerService
 *
 * Handles follower-related operations including following, unfollowing,
 * toggling follower status, and sending notifications.
 *
 * @package Modules\User\Services\User
 */
class FollowerService
{
	/**
	 * Toggles the follower status between a user and follower.
	 *
	 * @param mixed $userId The user being followed/unfollowed
	 * @param mixed $followerId The user doing the following/unfollowing
	 * @return object
	 */
	public function toggleFollower(mixed $userId, mixed $followerId): object
	{
		$user = User::get($userId);
		if (!$user)
		{
			return (object)['success' => false, 'error' => 'User not found.'];
		}

		$alreadyFollows = $this->alreadyFollows($userId, $followerId);
		$result = $user->followers()->toggle([$followerId]);
		if (!$result)
		{
			return Response::invalid('Failed to toggle follower status.');
		}

		$this->updateCounts($user, $followerId, $alreadyFollows ? 'down' : 'up');
		if (!$alreadyFollows)
		{
			$this->notifyNewFollower($userId, $followerId);
		}

		return Response::success(['result' => $result]);
	}

	/**
	 * Check if a user is already followed by another user.
	 *
	 * @param mixed $userId
	 * @param mixed $followerId
	 * @return bool
	 */
	protected function alreadyFollows(mixed $userId, mixed $followerId): bool
	{
		return FollowerUser::isAdded($userId, $followerId);
	}

	/**
	 * Adds a follower to a user.
	 *
	 * @param mixed $userId The user being followed
	 * @param mixed $followerId The user doing the following
	 * @return object
	 */
	public function followUser(mixed $userId, mixed $followerId): object
	{
		$user = User::get($userId);
		if (!$user)
		{
			return Response::invalid('User not found.');
		}

		if ($this->alreadyFollows($userId, $followerId))
		{
			return Response::invalid('User is already followed.');
		}

		$result = $user->followers()->attach($followerId);
		if (!$result)
		{
			return Response::invalid('Failed to follow user.');
		}

		$this->notifyNewFollower($userId, $followerId);

		$countUpdate = $this->updateCounts($user, $followerId, 'up');
		if (!$countUpdate)
		{
			return Response::invalid('Failed to update follower count.');
		}

		return Response::success(['result' => $result]);
	}

	/**
	 * Removes a follower from a user.
	 *
	 * @param mixed $userId The user being unfollowed
	 * @param mixed $followerId The user doing the unfollowing
	 * @return object
	 */
	public function unfollowUser(mixed $userId, mixed $followerId): object
	{
		$user = User::get($userId);
		if (!$user)
		{
			return Response::invalid('User not found.');
		}

		if (!$this->alreadyFollows($userId, $followerId))
		{
			return Response::invalid('User is not followed.');
		}

		$result = $user->followers()->detach($followerId);
		if (!$result)
		{
			return Response::invalid('Failed to unfollow user.');
		}

		$countUpdate = $this->updateCounts($user, $followerId, 'down');
		if (!$countUpdate)
		{
			return Response::invalid('Failed to update follower count.');
		}

		return Response::success(['result' => $result]);
	}

	/**
	 * Updates the follower count for a user.
	 *
	 * @param User $user The user object
	 * @param string $direction The direction to update ('up' or 'down')
	 * @return bool
	 */
	protected function updateCounts(User $user, mixed $followerId, string $direction = 'up'): bool
	{
		$result = $this->updateFollowerCount($user, $direction);
		if (!$result)
		{
			return false;
		}

		$result = $this->updateFollowingCount($followerId, $direction);
		if (!$result)
		{
			return false;
		}

		return true;
	}

	/**
	 * Send notification email to user about new follower.
	 *
	 * @param mixed $userId The user who gained a follower
	 * @param mixed $followerId The user who started following
	 * @param bool $queue Whether to queue the email
	 * @return object
	 */
	public function notifyNewFollower(mixed $userId, mixed $followerId, bool $queue = true): object
	{
		$user = User::get($userId);
		if (!$user)
		{
			return Response::invalid('User not found.');
		}

		$follower = User::get($followerId);
		if (!$follower)
		{
			return Response::invalid('Follower not found.');
		}

		return $this->dispatchNotification($user, $follower, $queue);
	}

	/**
	 * Updates the follower count for a user.
	 *
	 * @param User $user The user object
	 * @param string $direction The direction to update ('up' or 'down')
	 * @return bool
	 */
	protected function updateFollowerCount(User $user, string $direction = 'up'): bool
	{
		$newFollowerCount = ($direction === 'up') ? (++$user->followerCount) : (--$user->followerCount);

		$model = new User((object)[
			'id' => $user->id,
			'followerCount' => $newFollowerCount
		]);
		return $model->update();
	}

	/**
	 * Updates the follower count for a user.
	 *
	 * @param User $user The user object
	 * @param string $direction The direction to update ('up' or 'down')
	 * @return bool
	 */
	protected function updateFollowingCount(mixed $followerId, string $direction = 'up'): bool
	{
		$follower = User::get($followerId);
		if (!$follower)
		{
			return false;
		}

		$newFollowingCount = ($direction === 'up') ? (++$follower->followingCount) : (--$follower->followingCount);

		$model = new User((object)[
			'id' => $follower->id,
			'followingCount' => $newFollowingCount
		]);
		return $model->update();
	}

	/**
	 * Queue and dispatch a notification via the app's dispatcher.
	 *
	 * @param User $user The user to notify
	 * @param User $follower The follower user
	 * @param bool $queue Whether to queue the email
	 * @return object
	 */
	protected function dispatchNotification(User $user, User $follower, bool $queue = true): object
	{
		$settings = (object)[
			'to' => $user->email,
			'template' => NewFollowerPush::class
		];

		if ($queue)
		{
			$settings->queue = true;
		}

		$data = (object)[
			'user' => $user,
			'follower' => $follower
		];

		return modules()->user()->push()->send($user->id, $settings, $data);
	}
}
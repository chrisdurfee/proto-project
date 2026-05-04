<?php declare(strict_types=1);
namespace Modules\User\Follower\Services;

use Common\Services\Service;
use Modules\User\Main\Models\User;
use Modules\User\Follower\Models\FollowerUser;
use Modules\User\Follower\Push\NewFollowerPush;
use Modules\Tracking\Signals\Signals\SignalType;
use Proto\Controllers\Response;

/**
 * FollowerService
 *
 * Handles follower-related operations including following, unfollowing,
 * toggling follower status, and sending notifications.
 *
 * @package Modules\User\Services\User
 */
class FollowerService extends Service
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

			modules()->tracking()->signal()->record((int)$followerId, SignalType::USER_FOLLOWED, [
				'userId' => (int)$userId,
				'followerId' => (int)$followerId
			]);
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

		modules()->tracking()->signal()->record((int)$followerId, SignalType::USER_FOLLOWED, [
			'userId' => (int)$userId,
			'followerId' => (int)$followerId
		]);

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

		$this->logFollowerNotification((int)$userId, $follower);
		return $this->dispatchNotification($user, $follower, $queue);
	}

	/**
	 * Log an in-app notification for a new follower.
	 *
	 * @param int $userId The user who gained a follower
	 * @param User $follower The user who started following
	 * @return void
	 */
	protected function logFollowerNotification(int $userId, User $follower): void
	{
		$name = trim("{$follower->firstName} {$follower->lastName}") ?: $follower->username;
		modules()->notification()->log(
			$userId,
			'social',
			'social',
			'medium',
			'New Follower',
			"{$name} started following you",
			'person_add',
			[
				'refId' => (int)$follower->id,
				'refType' => 'user',
				'createdAt' => date('Y-m-d H:i:s')
			]
		);
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
		if ($direction === 'up')
		{
			return User::atomicIncrement($user->id, 'followerCount');
		}

		return User::atomicDecrement($user->id, 'followerCount');
	}

	/**
	 * Updates the following count for a user.
	 *
	 * @param mixed $followerId
	 * @param string $direction The direction to update ('up' or 'down')
	 * @return bool
	 */
	protected function updateFollowingCount(mixed $followerId, string $direction = 'up'): bool
	{
		if ($direction === 'up')
		{
			return User::atomicIncrement($followerId, 'followingCount');
		}

		return User::atomicDecrement($followerId, 'followingCount');
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

	/**
	 * Re-compute followerCount and followingCount for a user directly from the
	 * follower_users table and persist the corrected values to the users table.
	 *
	 * @param mixed $userId
	 * @return object
	 */
	public function syncCounts(mixed $userId): object
	{
		$user = User::get($userId);
		if (!$user)
		{
			return Response::invalid('User not found.');
		}

		$followerCount = $this->getActualFollowerCount($userId);
		$followingCount = $this->getActualFollowingCount($userId);

		$model = new User((object)[
			'id' => $user->id,
			'followerCount' => $followerCount,
			'followingCount' => $followingCount
		]);

		if (!$model->update())
		{
			return Response::invalid('Failed to sync follower counts.');
		}

		return Response::success([
			'followerCount' => $followerCount,
			'followingCount' => $followingCount
		]);
	}

	/**
	 * Count actual followers (rows where user_id = $userId).
	 *
	 * @param mixed $userId
	 * @return int
	 */
	protected function getActualFollowerCount(mixed $userId): int
	{
		$row = FollowerUser::builder()
			->select([['COUNT(*)'], 'total'])
			->where('user_id = ?')
			->first([(int)$userId]);

		return (int)($row->total ?? 0);
	}

	/**
	 * Count actual following (rows where follower_user_id = $userId).
	 *
	 * @param mixed $userId
	 * @return int
	 */
	protected function getActualFollowingCount(mixed $userId): int
	{
		$row = FollowerUser::builder()
			->select([['COUNT(*)'], 'total'])
			->where('follower_user_id = ?')
			->first([(int)$userId]);

		return (int)($row->total ?? 0);
	}
}
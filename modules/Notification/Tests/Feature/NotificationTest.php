<?php declare(strict_types=1);

namespace Modules\Notification\Tests\Feature;

use Proto\Tests\Test;
use Modules\Notification\Models\UserNotification;
use Modules\Notification\Services\NotificationService;
use Modules\User\Main\Models\User;

/**
 * NotificationTest
 *
 * Feature tests for the Notification module.
 *
 * @package Modules\Notification\Tests\Feature
 */
class NotificationTest extends Test
{
	/**
	 * @var NotificationService $service
	 */
	protected NotificationService $service;

	/**
	 * Set up the test environment.
	 *
	 * @return void
	 */
	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new NotificationService();
	}

	/**
	 * A notification can be created via the factory.
	 *
	 * @return void
	 */
	public function testCreateNotificationViaFactory(): void
	{
		$user = User::factory()->create();
		$notification = UserNotification::factory()->create(['userId' => $user->id]);

		$this->assertNotNull($notification->id);
		$this->assertDatabaseHas('user_notifications', [
			'id' => $notification->id,
			'userId' => $user->id
		]);
	}

	/**
	 * A notification can be logged via the service.
	 *
	 * @return void
	 */
	public function testLogNotificationViaService(): void
	{
		$user = User::factory()->create();
		$notification = $this->service->log(
			$user->id,
			'social',
			'social',
			'medium',
			'New Likes',
			'Someone liked your post.',
			'favorite'
		);

		$this->assertNotNull($notification);
		$this->assertNotNull($notification->id);
		$this->assertDatabaseHas('user_notifications', [
			'id' => $notification->id,
			'userId' => $user->id,
			'type' => 'social',
			'category' => 'social',
			'isRead' => 0
		]);
	}

	/**
	 * A notification can be marked as read.
	 *
	 * @return void
	 */
	public function testMarkRead(): void
	{
		$user = User::factory()->create();
		$notification = UserNotification::factory()->create(['userId' => $user->id, 'isRead' => 0]);

		$result = $this->service->markRead($notification->id, $user->id);

		$this->assertTrue($result);
		$this->assertDatabaseHas('user_notifications', [
			'id' => $notification->id,
			'isRead' => 1
		]);
	}

	/**
	 * markRead returns false for a notification belonging to a different user.
	 *
	 * @return void
	 */
	public function testMarkReadFailsForWrongUser(): void
	{
		$owner = User::factory()->create();
		$other = User::factory()->create();
		$notification = UserNotification::factory()->create(['userId' => $owner->id]);

		$result = $this->service->markRead($notification->id, $other->id);

		$this->assertFalse($result);
	}

	/**
	 * All notifications for a user can be marked as read.
	 *
	 * @return void
	 */
	public function testMarkAllRead(): void
	{
		$user = User::factory()->create();
		UserNotification::factory()->count(3)->create(['userId' => $user->id, 'isRead' => 0]);

		$result = $this->service->markAllRead($user->id);

		$this->assertTrue($result);
		$this->assertDatabaseHas('user_notifications', ['userId' => $user->id, 'isRead' => 1]);
	}

	/**
	 * A notification can be dismissed (soft-deleted).
	 *
	 * @return void
	 */
	public function testDismiss(): void
	{
		$user = User::factory()->create();
		$notification = UserNotification::factory()->create(['userId' => $user->id]);

		$result = $this->service->dismiss($notification->id, $user->id);

		$this->assertTrue($result);
	}

	/**
	 * dismiss returns false for a notification belonging to a different user.
	 *
	 * @return void
	 */
	public function testDismissFailsForWrongUser(): void
	{
		$owner = User::factory()->create();
		$other = User::factory()->create();
		$notification = UserNotification::factory()->create(['userId' => $owner->id]);

		$result = $this->service->dismiss($notification->id, $other->id);

		$this->assertFalse($result);
	}

	/**
	 * getForUser returns only that user's notifications.
	 *
	 * @return void
	 */
	public function testGetForUserScopesToOwner(): void
	{
		$userA = User::factory()->create();
		$userB = User::factory()->create();

		UserNotification::factory()->count(5)->create(['userId' => $userA->id]);
		UserNotification::factory()->count(2)->create(['userId' => $userB->id]);

		$results = UserNotification::getForUser($userA->id);

		$this->assertCount(5, $results);
	}

	/**
	 * getForUser can filter by category.
	 *
	 * @return void
	 */
	public function testGetForUserFiltersByCategory(): void
	{
		$user = User::factory()->create();

		UserNotification::factory()->count(3)->create(['userId' => $user->id, 'category' => 'social']);
		UserNotification::factory()->count(2)->create(['userId' => $user->id, 'category' => 'market']);

		$social = UserNotification::getForUser($user->id, 'social');
		$market = UserNotification::getForUser($user->id, 'market');

		$this->assertCount(3, $social);
		$this->assertCount(2, $market);
	}

	/**
	 * getUnreadCount returns the correct count.
	 *
	 * @return void
	 */
	public function testGetUnreadCount(): void
	{
		$user = User::factory()->create();

		UserNotification::factory()->count(4)->create(['userId' => $user->id, 'isRead' => 0]);
		UserNotification::factory()->count(2)->create(['userId' => $user->id, 'isRead' => 1]);

		$count = UserNotification::getUnreadCount($user->id);

		$this->assertEquals(4, $count);
	}

	/**
	 * A notification logged with options stores them correctly.
	 *
	 * @return void
	 */
	public function testLogWithOptions(): void
	{
		$user = User::factory()->create();
		$notification = $this->service->log(
			$user->id,
			'garage',
			'maintenance',
			'high',
			'Service Reminder: GT3',
			'Major service interval approaching.',
			'build',
			[
				'primaryAction' => 'Book Now',
				'secondaryAction' => 'Snooze',
				'refId' => 42,
				'refType' => 'car_profile'
			]
		);

		$this->assertNotNull($notification);
		$this->assertDatabaseHas('user_notifications', [
			'id' => $notification->id,
			'primaryAction' => 'Book Now',
			'secondaryAction' => 'Snooze',
			'refId' => 42,
			'refType' => 'car_profile',
			'priority' => 'high'
		]);
	}
}

<?php declare(strict_types=1);

namespace Modules\Notification\Tests\Feature;

use Modules\Notification\Auth\Policies\NotificationPolicy;
use Modules\Notification\Models\UserNotification;
use Modules\User\Main\Models\Factories\UserFactory;
use Proto\Http\Router\Request;
use Proto\Tests\Test;

/**
 * NotificationPolicyTest
 *
 * Guards against the IDOR where a `before()` returning a bare
 * isSignedIn() short-circuited every ownership check, letting any
 * authenticated user read, modify or delete another user's
 * notification by id.
 *
 * @package Modules\Notification\Tests\Feature
 */
class NotificationPolicyTest extends Test
{
	/**
	 * @var int|null $notificationId
	 */
	protected ?int $notificationId = null;

	/**
	 * @var int|null $ownerId
	 */
	protected ?int $ownerId = null;

	/**
	 * @var int|null $otherUserId
	 */
	protected ?int $otherUserId = null;

	/**
	 * @return void
	 */
	protected function setUp(): void
	{
		parent::setUp();

		$this->ownerId = (int)UserFactory::new()->create()->id;
		$this->otherUserId = (int)UserFactory::new()->create()->id;

		$notification = new UserNotification((object)[
			'userId' => $this->ownerId,
			'type' => 'updates',
			'category' => 'updates',
			'title' => 'Owner only',
			'description' => 'Visible to the owning user only.',
			'iconName' => 'bell'
		]);
		$notification->add();

		$this->notificationId = (int)$notification->id;
	}

	/**
	 * @return void
	 */
	protected function tearDown(): void
	{
		session()->user = null;
		unset($_REQUEST['id'], $_GET['id']);
		parent::tearDown();
	}

	/**
	 * @param int $userId
	 * @param array $roles
	 * @return void
	 */
	protected function signInAs(int $userId, array $roles = []): void
	{
		session()->user = (object)[
			'id' => $userId,
			'roles' => $roles
		];
	}

	/**
	 * @return Request
	 */
	protected function requestForNotification(): Request
	{
		$_REQUEST['id'] = (string)$this->notificationId;
		$_GET['id'] = (string)$this->notificationId;
		return new Request();
	}

	/**
	 * A signed-in non-owner must not read another user's notification.
	 *
	 * @return void
	 */
	public function testOtherUserCannotGetForeignNotification(): void
	{
		$this->signInAs($this->otherUserId);

		$policy = new NotificationPolicy();
		$request = $this->requestForNotification();

		$this->assertFalse($policy->before($request));
		$this->assertFalse($policy->get($request));
	}

	/**
	 * A signed-in non-owner must not update or delete a foreign notification.
	 *
	 * @return void
	 */
	public function testOtherUserCannotMutateForeignNotification(): void
	{
		$this->signInAs($this->otherUserId);

		$policy = new NotificationPolicy();
		$request = $this->requestForNotification();

		$this->assertFalse($policy->update($request));
		$this->assertFalse($policy->delete($request));
		$this->assertFalse($policy->markRead($request));
		$this->assertFalse($policy->dismiss($request));
	}

	/**
	 * The owner retains access to their own notification.
	 *
	 * @return void
	 */
	public function testOwnerCanAccessOwnNotification(): void
	{
		$this->signInAs($this->ownerId);

		$policy = new NotificationPolicy();
		$request = $this->requestForNotification();

		$this->assertTrue($policy->get($request));
		$this->assertTrue($policy->update($request));
		$this->assertTrue($policy->delete($request));
	}

	/**
	 * Self-scoped aggregate endpoints stay open to any signed-in user.
	 *
	 * @return void
	 */
	public function testSelfScopedEndpointsAllowAnySignedInUser(): void
	{
		$this->signInAs($this->otherUserId);

		$policy = new NotificationPolicy();
		$request = new Request();

		$this->assertTrue($policy->all($request));
		$this->assertTrue($policy->unreadCount($request));
		$this->assertTrue($policy->markAllRead($request));
	}

	/**
	 * Guests are denied everywhere.
	 *
	 * @return void
	 */
	public function testGuestIsDenied(): void
	{
		session()->user = null;

		$policy = new NotificationPolicy();
		$request = $this->requestForNotification();

		$this->assertFalse($policy->before($request));
		$this->assertFalse($policy->all($request));
		$this->assertFalse($policy->get($request));
	}
}

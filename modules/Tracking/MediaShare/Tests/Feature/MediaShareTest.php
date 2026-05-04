<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Tests\Feature;

use Proto\Tests\Test;
use Modules\Tracking\MediaShare\Models\MediaShare;
use Modules\User\Main\Models\User;

/**
 * MediaShareTest
 *
 * Feature tests for media share tracking.
 *
 * @package Modules\Tracking\MediaShare\Tests\Feature
 */
class MediaShareTest extends Test
{
	/**
	 * Create a test user.
	 *
	 * @return User
	 */
	protected function createUser(): User
	{
		return User::factory()->create();
	}

	/**
	 * Test creating a media share record.
	 *
	 * @return void
	 */
	public function testCreateMediaShare(): void
	{
		$user = $this->createUser();

		$share = new MediaShare((object)[
			'userId' => $user->id,
			'mediaId' => 1,
			'mediaType' => 'vehicle',
			'shareType' => 'external',
		]);
		$share->add();

		$this->assertNotNull($share->id);
		$this->assertDatabaseHas('media_shares', [
			'userId' => $user->id,
			'mediaId' => 1,
			'mediaType' => 'vehicle',
			'shareType' => 'external',
		]);
	}

	/**
	 * Test creating a group media share record.
	 *
	 * @return void
	 */
	public function testCreateGroupMediaShare(): void
	{
		$user = $this->createUser();

		$share = new MediaShare((object)[
			'userId' => $user->id,
			'mediaId' => 2,
			'mediaType' => 'group',
			'shareType' => 'copy_link',
		]);
		$share->add();

		$this->assertNotNull($share->id);
		$this->assertDatabaseHas('media_shares', [
			'userId' => $user->id,
			'mediaId' => 2,
			'mediaType' => 'group',
			'shareType' => 'copy_link',
		]);
	}

	/**
	 * Test factory creates valid share records.
	 *
	 * @return void
	 */
	public function testFactoryCreatesShare(): void
	{
		$user = $this->createUser();

		$share = MediaShare::factory()->create([
			'userId' => $user->id,
			'mediaId' => 5,
			'mediaType' => 'vehicle',
		]);

		$this->assertNotNull($share->id);
		$this->assertEquals($user->id, $share->userId);
		$this->assertEquals(5, $share->mediaId);
	}

	/**
	 * Test the service records a share and prevents duplicates.
	 *
	 * @return void
	 */
	public function testServiceRecordsShareAndPreventsDuplicates(): void
	{
		$user = $this->createUser();

		$service = new \Modules\Tracking\MediaShare\Services\MediaShareService();

		$result1 = $service->share($user->id, 10, 'vehicle', 'external');
		$this->assertNotFalse($result1);
		$this->assertEquals($user->id, $result1->userId);

		$result2 = $service->share($user->id, 10, 'vehicle', 'external');
		$this->assertNotFalse($result2);
		$this->assertEquals($result1->id, $result2->id);
	}

	/**
	 * Test different users can share the same media.
	 *
	 * @return void
	 */
	public function testDifferentUsersCanShareSameMedia(): void
	{
		$user1 = $this->createUser();
		$user2 = $this->createUser();

		$share1 = new MediaShare((object)[
			'userId' => $user1->id,
			'mediaId' => 1,
			'mediaType' => 'vehicle',
			'shareType' => 'external',
		]);
		$share1->add();

		$share2 = new MediaShare((object)[
			'userId' => $user2->id,
			'mediaId' => 1,
			'mediaType' => 'vehicle',
			'shareType' => 'copy_link',
		]);
		$share2->add();

		$this->assertNotNull($share1->id);
		$this->assertNotNull($share2->id);
		$this->assertNotEquals($share1->id, $share2->id);
	}
}

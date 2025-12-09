<?php declare(strict_types=1);
namespace Modules\Auth\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Services\User\NewUserService;
use Modules\User\Models\User;

/**
 * ManualSignUpTest
 *
 * Tests the manual sign-up and profile update flow.
 *
 * @package Modules\Auth\Tests\Feature
 */
class ManualSignUpTest extends Test
{
	/**
	 * Test manual user registration.
	 */
	public function testManualRegistration(): void
	{
		$service = new NewUserService();
		$data = (object)[
			'username' => 'manual_test@example.com',
			'password' => 'Password123!',
			'firstName' => 'Manual',
			'lastName' => 'Tester'
		];

		$user = $service->createUser($data);

		$this->assertNotNull($user);
		$this->assertEquals('manual_test@example.com', $user->email);
		$this->assertEquals('manual_test@example.com', $user->username); // Email is used as username

		// Verify user is in DB
		$this->assertDatabaseHas('users', ['email' => 'manual_test@example.com']);
	}

	/**
	 * Test profile update after registration.
	 */
	public function testProfileUpdate(): void
	{
		// 1. Create user first
		$service = new NewUserService();
		$data = (object)[
			'username' => 'profile_update@example.com',
			'password' => 'Password123!'
		];
		$user = $service->createUser($data);
		$this->assertNotNull($user);

		// 2. Update profile
		$updateData = (object)[
			'id' => $user->id,
			'firstName' => 'Updated',
			'lastName' => 'Name',
			'bio' => 'This is a bio.'
		];

		$updatedUser = $service->updateProfile($updateData);

		$this->assertNotNull($updatedUser);
		$this->assertEquals('Updated', $updatedUser->firstName);
		$this->assertEquals('Name', $updatedUser->lastName);
		$this->assertEquals('This is a bio.', $updatedUser->bio);
		$this->assertEquals(1, $updatedUser->enabled); // Should be enabled after profile update

		// Verify in DB
		$this->assertDatabaseHas('users', [
			'id' => $user->id,
			'first_name' => 'Updated',
			'bio' => 'This is a bio.'
		]);
	}

	/**
	 * Test that duplicate email registration fails.
	 */
	public function testDuplicateRegistrationFails(): void
	{
		$service = new NewUserService();
		$data = (object)[
			'username' => 'duplicate@example.com',
			'password' => 'Password123!'
		];

		$user1 = $service->createUser($data);
		$this->assertNotNull($user1);

		$this->expectException(\Exception::class);
		$this->expectExceptionMessage('Username already taken.');

		$service->createUser($data);
	}
}

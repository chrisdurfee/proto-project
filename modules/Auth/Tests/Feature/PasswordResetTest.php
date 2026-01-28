<?php declare(strict_types=1);
namespace Modules\Auth\Tests\Feature;

use Proto\Tests\Test;
use Modules\Auth\Services\Password\PasswordService;
use Modules\User\Main\Models\User;
use Modules\Auth\Models\PasswordRequest;

/**
 * PasswordResetTest
 *
 * Tests the password reset flow.
 *
 * @package Modules\Auth\Tests\Feature
 */
class PasswordResetTest extends Test
{
	/**
	 * Test requesting a password reset.
	 */
	public function testRequestPasswordReset(): void
	{
		// Create a user
		$user = User::factory()->create([
			'email' => 'reset_test@example.com',
			'password' => 'OldPassword123!'
		]);

		$service = new PasswordService();
		$result = $service->sendResetRequest($user);

		$this->assertNotNull($result);
		$this->assertNotNull($result->email);

		// Verify request is in DB
		$this->assertDatabaseHas('password_requests', [
			'user_id' => $user->id
		]);
	}

	/**
	 * Test validating a password reset request.
	 */
	public function testValidatePasswordRequest(): void
	{
		// Create a user
		$user = User::factory()->create([
			'email' => 'validate_test@example.com'
		]);

		// Create a request manually
		$request = new PasswordRequest();
		$request->set('userId', $user->id);
		$request->add();
		$requestId = $request->requestId;

		$service = new PasswordService();
		$username = $service->validateRequest($requestId, $user->id);

		$this->assertEquals($user->username, $username);
	}

	/**
	 * Test resetting the password.
	 */
	public function testResetPassword(): void
	{
		// Create a user
		$user = User::factory()->create([
			'email' => 'reset_complete@example.com',
			'password' => 'OldPassword123!'
		]);

		// Create a request manually
		$request = new PasswordRequest();
		$request->set('userId', $user->id);
		$request->add();
		$requestId = $request->requestId;

		$service = new PasswordService();
		$newPassword = 'NewPassword456!';

		$result = $service->resetPassword($requestId, $user->id, $newPassword);

		$this->assertTrue($result);

		// Verify password was changed (we can't check hash directly easily, but we can try to auth)
		$authId = modules()->user()->authenticate($user->username, $newPassword);
		$this->assertEquals($user->id, $authId);

		// Verify old password fails
		$failId = modules()->user()->authenticate($user->username, 'OldPassword123!');
		$this->assertEquals(-1, $failId);
	}

	/**
	 * Test invalid reset request fails.
	 */
	public function testInvalidResetRequestFails(): void
	{
		$service = new PasswordService();
		$result = $service->resetPassword('invalid_id', 99999, 'NewPass');

		$this->assertEquals(-1, $result);
	}
}

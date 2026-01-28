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
		// Create a user with properly hashed password
		$user = User::factory()->create([
			'email' => 'reset_test@example.com',
			'password' => password_hash('OldPassword123!', PASSWORD_BCRYPT)
		]);

		$this->assertNotNull($user->id, 'User should be created with an ID');

		$service = new PasswordService();
		$result = $service->sendResetRequest($user);

		$this->assertNotNull($result);
		// Note: email dispatch result may be null in test environment without SMTP
		// The important thing is that the request was created

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

		$this->assertNotNull($user->id, 'User should be created with an ID');

		// Create a request manually
		$request = new PasswordRequest();
		$request->set('userId', $user->id);
		$addResult = $request->add();

		$this->assertTrue($addResult, 'PasswordRequest should be added successfully');
		$this->assertNotNull($request->requestId, 'PasswordRequest should have a requestId after add');

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
		$oldPassword = 'OldPassword123!';
		$newPassword = 'NewPassword456!';

		// Create a user with properly hashed password
		$user = User::factory()->create([
			'email' => 'reset_complete@example.com',
			'password' => password_hash($oldPassword, PASSWORD_BCRYPT)
		]);

		$this->assertNotNull($user->id, 'User should be created with an ID');

		// Verify old password works before reset
		$authBefore = modules()->user()->authenticate($user->username, $oldPassword);
		$this->assertEquals($user->id, $authBefore, 'Should authenticate with old password before reset');

		// Create a request manually
		$request = new PasswordRequest();
		$request->set('userId', $user->id);
		$addResult = $request->add();

		$this->assertTrue($addResult, 'PasswordRequest should be added successfully');
		$requestId = $request->requestId;

		$service = new PasswordService();
		$result = $service->resetPassword($requestId, $user->id, $newPassword);

		$this->assertTrue($result, 'Password reset should succeed');

		// Verify password was changed
		$authId = modules()->user()->authenticate($user->username, $newPassword);
		$this->assertEquals($user->id, $authId, 'Should authenticate with new password');

		// Verify old password fails
		$failId = modules()->user()->authenticate($user->username, $oldPassword);
		$this->assertEquals(-1, $failId, 'Old password should fail after reset');
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

<?php declare(strict_types=1);
namespace Modules\Auth\Tests\Feature;

use Proto\Tests\Test;
use Modules\Auth\Services\Auth\GoogleSignInService;
use Modules\Auth\Integrations\Google\GoogleService;
use Modules\User\Models\User;
use Modules\User\Services\User\UserImageService;

/**
 * GoogleSignUpTest
 *
 * Tests the Google Sign-Up flow.
 *
 * @package Modules\Auth\Tests\Feature
 */
class GoogleSignUpTest extends Test
{
	/**
	 * Test that a new user is created from a Google profile.
	 */
	public function testCreateUserFromGoogleProfile(): void
	{
		// Mock GoogleService
		$mockGoogle = $this->createMock(GoogleService::class);
		$mockGoogle->method('getAccessToken')->willReturn((object)['access_token' => 'fake_token']);
		$mockGoogle->method('getUserProfile')->willReturn((object)[
			'email' => 'google_test@example.com',
			'email_verified' => true,
			'given_name' => 'Google',
			'family_name' => 'User',
			'name' => 'Google User',
			'picture' => null // Skip image download for this test
		]);

		$service = new GoogleSignInService($mockGoogle);
		$result = $service->handleCallback('fake_code');

		$this->assertNotNull($result, 'Result should not be null');
		$this->assertTrue($result->isNew, 'User should be new');
		$user = $result->user;

		$this->assertEquals('google_test@example.com', $user->email);
		$this->assertEquals('Google', $user->firstName);
		$this->assertEquals('User', $user->lastName);
		$this->assertNotNull($user->emailVerifiedAt);

		// Verify user is in DB
		$this->assertDatabaseHas('users', ['email' => 'google_test@example.com']);
	}

	/**
	 * Test that an existing user is logged in via Google.
	 */
	public function testLoginExistingUserWithGoogle(): void
	{
		// Create a user first
		$existingUser = User::factory()->create([
			'email' => 'existing_google@example.com',
			'firstName' => 'Existing',
			'lastName' => 'User'
		]);

		// Mock GoogleService
		$mockGoogle = $this->createMock(GoogleService::class);
		$mockGoogle->method('getAccessToken')->willReturn((object)['access_token' => 'fake_token']);
		$mockGoogle->method('getUserProfile')->willReturn((object)[
			'email' => 'existing_google@example.com',
			'email_verified' => true,
			'given_name' => 'Google', // Different name from Google
			'family_name' => 'Update',
			'name' => 'Google Update',
			'picture' => null
		]);

		$service = new GoogleSignInService($mockGoogle);
		$result = $service->handleCallback('fake_code');

		$this->assertNotNull($result, 'Result should not be null');
		$this->assertFalse($result->isNew, 'User should not be new');
		$user = $result->user;


		// Ensure we didn't overwrite the existing user's name just by logging in
		// (The current logic in findOrCreateUser only creates if missing, or returns existing)
		$this->assertEquals('Existing', $user->firstName);
	}

	/**
	 * Test that unverified Google emails are rejected.
	 */
	public function testRejectUnverifiedGoogleEmail(): void
	{
		// Mock GoogleService
		$mockGoogle = $this->createMock(GoogleService::class);
		$mockGoogle->method('getAccessToken')->willReturn((object)['access_token' => 'fake_token']);
		$mockGoogle->method('getUserProfile')->willReturn((object)[
			'email' => 'unverified@example.com',
			'email_verified' => false, // Unverified
			'name' => 'Unverified User'
		]);

		$service = new GoogleSignInService($mockGoogle);
		$user = $service->handleCallback('fake_code');

		$this->assertNull($user);
	}
}

<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\User;
use Modules\User\Models\Role;

/**
 * UserTest
 *
 * Feature tests for User model using factories.
 * Tests CRUD operations, relationships, states, and business logic.
 *
 * @package Modules\User\Tests\Feature
 */
class UserTest extends Test
{
	/**
	 * Test creating a user with factory
	 *
	 * @return void
	 */
	public function testCreateUser(): void
	{
		$user = User::factory()->create();

		$this->assertNotNull($user->id);
		$this->assertNotNull($user->email);
		$this->assertNotNull($user->username);
		$this->assertEquals('offline', $user->status);
		$this->assertEquals(1, $user->enabled); // Database returns integer 1
	}

	/**
	 * Test creating multiple users
	 *
	 * @return void
	 */
	public function testCreateMultipleUsers(): void
	{
		$users = User::factory()->count(5)->create();

		$this->assertCount(5, $users);

		foreach ($users as $user) {
			$this->assertNotNull($user->id);
			$this->assertNotNull($user->email);
		}
	}

	/**
	 * Test creating user with specific attributes
	 *
	 * @return void
	 */
	public function testCreateUserWithSpecificAttributes(): void
	{
		$user = User::factory()->create([
			'email' => 'test@example.com',
			'firstName' => 'John',
			'lastName' => 'Doe'
		]);

		$this->assertEquals('test@example.com', $user->email);
		$this->assertEquals('John', $user->firstName);
		$this->assertEquals('Doe', $user->lastName);
	}

	/**
	 * Test creating verified user
	 *
	 * @return void
	 */
	public function testCreateVerifiedUser(): void
	{
		$user = User::factory()->state('verified')->create();

		$this->assertNotNull($user->emailVerifiedAt);
		$this->assertEquals(1, $user->verified); // Database returns integer 1
	}

	/**
	 * Test creating admin user
	 *
	 * @return void
	 */
	public function testCreateAdminUser(): void
	{
		$user = User::factory()->state('admin')->create();

		$this->assertEquals('online', $user->status);
		$this->assertEquals(1, $user->enabled); // Database returns integer 1
		$this->assertNotNull($user->emailVerifiedAt);
	}

	/**
	 * Test creating disabled user
	 *
	 * @return void
	 */
	public function testCreateDisabledUser(): void
	{
		$user = User::factory()->state('disabled')->create();

		// Database returns 0 (integer), not false (boolean)
		$this->assertEquals(0, $user->enabled);
		$this->assertEquals('offline', $user->status);
	}

	/**
	 * Test creating user in trial mode
	 *
	 * @return void
	 */
	public function testCreateTrialUser(): void
	{
		$user = User::factory()->state('trial')->create();

		$this->assertTrue($user->trialMode);
		$this->assertGreaterThan(0, $user->trialDaysLeft);
		$this->assertLessThanOrEqual(30, $user->trialDaysLeft);
	}

	/**
	 * Test creating user with MFA enabled
	 *
	 * @return void
	 */
	public function testCreateUserWithMfaEnabled(): void
	{
		$user = User::factory()->state('mfaEnabled')->create();

		$this->assertTrue($user->multiFactorEnabled);
	}

	/**
	 * Test creating user with complete profile
	 *
	 * @return void
	 */
	public function testCreateUserWithCompleteProfile(): void
	{
		$user = User::factory()->state('completeProfile')->create();

		$this->assertNotNull($user->bio);
		$this->assertNotNull($user->dob);
		$this->assertNotNull($user->gender);
		$this->assertNotNull($user->street1);
		$this->assertNotNull($user->city);
		$this->assertNotNull($user->state);
		$this->assertNotNull($user->postalCode);
	}

	/**
	 * Test creating user with custom domain
	 *
	 * @return void
	 */
	public function testCreateUserWithCustomDomain(): void
	{
		$user = User::factory()->state('withDomain', 'company.com')->create();

		$this->assertStringContainsString('@company.com', $user->email);
	}

	/**
	 * Test making user without persisting to database
	 *
	 * @return void
	 */
	public function testMakeUserWithoutPersisting(): void
	{
		$user = User::factory()->make();

		$this->assertNull($user->id);
		$this->assertNotNull($user->email);
		$this->assertNotNull($user->username);
	}

	/**
	 * Test getting raw attributes
	 *
	 * @return void
	 */
	public function testGetRawAttributes(): void
	{
		$attributes = User::factory()->raw();

		$this->assertIsArray($attributes);
		$this->assertArrayHasKey('email', $attributes);
		$this->assertArrayHasKey('username', $attributes);
		$this->assertArrayHasKey('firstName', $attributes);
	}

	/**
	 * Test combining multiple states
	 *
	 * @return void
	 */
	public function testCombineMultipleStates(): void
	{
		$user = User::factory()
			->state('verified')
			->state('completeProfile')
			->create();

		$this->assertNotNull($user->emailVerifiedAt);
		$this->assertEquals(1, $user->verified); // Database returns integer 1
		$this->assertNotNull($user->bio);
		$this->assertNotNull($user->city);
	}

	/**
	 * Test user can be retrieved after creation
	 *
	 * @return void
	 */
	public function testUserCanBeRetrievedAfterCreation(): void
	{
		$user = User::factory()->create([
			'email' => 'retrieve@example.com'
		]);

		$this->assertNotNull($user->id, 'User should have an ID after creation');

		// Verify in database first
		$this->assertDatabaseHas('users', [
			'id' => $user->id,
			'email' => 'retrieve@example.com'
		]);

		// Use fetchWhere which is transaction-safe
		$results = User::fetchWhere(['id' => $user->id]);
		$this->assertCount(1, $results, 'User should be retrievable by ID');
		$retrieved = $results[0];

		$this->assertNotNull($retrieved, 'User should be retrievable by ID');
		$this->assertEquals($user->id, $retrieved->id);
		$this->assertEquals('retrieve@example.com', $retrieved->email);

		// Also test with email
		$emailResults = User::fetchWhere(['email' => 'retrieve@example.com']);
		$this->assertCount(1, $emailResults, 'User should be retrievable by email');
		$this->assertEquals($user->id, $emailResults[0]->id);
	}

	/**
	 * Test user can be updated
	 *
	 * @return void
	 */
	public function testUserCanBeUpdated(): void
	{
		$user = User::factory()->create();
		$originalId = $user->id;

		$user->firstName = 'Updated';
		$user->lastName = 'Name';
		$result = $user->update();

		$this->assertTrue($result, 'Update should return true');
		$this->assertNotNull($user->id, 'User ID should not be null after update');
		$this->assertEquals($originalId, $user->id, 'User ID should not change after update');

		// Verify directly in database (use snake_case column names)
		$this->assertDatabaseHas('users', [
			'id' => $user->id,
			'first_name' => 'Updated',
			'last_name' => 'Name'
		]);

		// Use fetchWhere which is transaction-safe
		$results = User::fetchWhere(['id' => $user->id]);
		$this->assertCount(1, $results, 'User should be retrievable after update');
		$updated = $results[0];

		$this->assertNotNull($updated, 'User should be retrievable after update');
		$this->assertEquals('Updated', $updated->firstName, 'First name should be updated');
		$this->assertEquals('Name', $updated->lastName, 'Last name should be updated');
	}

	/**
	 * Test user can be deleted
	 *
	 * @return void
	 */
	public function testUserCanBeDeleted(): void
	{
		$user = User::factory()->create();
		$userId = $user->id;

		$result = $user->delete();

		$this->assertTrue($result, 'Delete should return true');

		// User model uses soft deletes (deletedAt field)
		// Verify user still exists in database but with deletedAt set
		$this->assertDatabaseHas('users', [
			'id' => $userId
		]);

		// Check that deleted_at was set in the database (use raw DB query to bypass soft-delete filter)
		$db = \Proto\Database\Database::getConnection();
		$rows = $db->fetch("SELECT id, deleted_at FROM users WHERE id = ?", [$userId]);
		$this->assertCount(1, $rows, 'User record should still exist in database');
		$this->assertNotNull($rows[0]->deleted_at, 'deleted_at should be set after soft delete');

		// Verify that default queries (fetchWhere) filter out soft-deleted records
		$fetchResults = User::fetchWhere(['id' => $userId]);
		$this->assertCount(0, $fetchResults, 'Soft-deleted users should not be returned by fetchWhere without showDeleted modifier');
	}

	/**
	 * Test creating sequence of users with variations
	 *
	 * @return void
	 */
	public function testCreateUsersWithSequence(): void
	{
		$users = [];
		for ($i = 0; $i < 3; $i++) {
			$users[] = User::factory()->create([
				'firstName' => "User{$i}",
				'followerCount' => $i * 10
			]);
		}

		$this->assertEquals('User0', $users[0]->firstName);
		$this->assertEquals(0, $users[0]->followerCount);

		$this->assertEquals('User1', $users[1]->firstName);
		$this->assertEquals(10, $users[1]->followerCount);

		$this->assertEquals('User2', $users[2]->firstName);
		$this->assertEquals(20, $users[2]->followerCount);
	}

	/**
	 * Test user status transitions
	 *
	 * @return void
	 */
	public function testUserStatusTransitions(): void
	{
		$user = User::factory()->create(['status' => 'online']);
		$this->assertEquals('online', $user->status);

		$user->status = 'away';
		$result = $user->update();

		$this->assertTrue($result, 'Update should return true');

		// Verify directly in database
		$this->assertDatabaseHas('users', [
			'id' => $user->id,
			'status' => 'away'
		]);

		// Use fetchWhere which is transaction-safe
		$results = User::fetchWhere(['id' => $user->id]);
		$this->assertCount(1, $results, 'User should be retrievable after status update');
		$updated = $results[0];

		$this->assertNotNull($updated, 'User should be retrievable after status update');
		$this->assertEquals('away', $updated->status, 'Status should be updated to away');
	}

	/**
	 * Test user email uniqueness
	 *
	 * @return void
	 */
	public function testUserEmailIsUnique(): void
	{
		$email = 'unique@example.com';

		$user1 = User::factory()->create(['email' => $email]);
		$this->assertEquals($email, $user1->email);

		// Second user with different email should work
		$user2 = User::factory()->create(['email' => 'different@example.com']);
		$this->assertNotEquals($user1->email, $user2->email);
	}
}

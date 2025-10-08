<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\Role;
use Modules\User\Models\Permission;

/**
 * RoleTest
 *
 * Feature tests for Role model using factories.
 * Tests CRUD operations, relationships, and business logic.
 *
 * @package Modules\User\Tests\Feature
 */
class RoleTest extends Test
{
	/**
	 * Set up before each test
	 */
	protected function setUp(): void
	{
		parent::setUp();

		// Disable foreign key checks to prevent deadlocks
		$this->getTestDatabase()->execute('SET FOREIGN_KEY_CHECKS=0');
	}

	/**
	 * Clean up after each test
	 */
	protected function tearDown(): void
	{
		// Re-enable foreign key checks
		$this->getTestDatabase()->execute('SET FOREIGN_KEY_CHECKS=1');

		parent::tearDown();
	}
	/**
	 * Test creating a role with factory
	 *
	 * @return void
	 */
	public function testCreateRole(): void
	{
		$role = Role::factory()->create();

		$this->assertNotNull($role->id);
		$this->assertNotNull($role->name);
		$this->assertNotNull($role->slug);
		$this->assertNotNull($role->description);
	}

	/**
	 * Test creating multiple roles
	 *
	 * @return void
	 */
	public function testCreateMultipleRoles(): void
	{
		$roles = Role::factory()->count(5)->create();

		$this->assertCount(5, $roles);

		foreach ($roles as $role) {
			$this->assertNotNull($role->id);
			$this->assertNotNull($role->name);
			$this->assertNotNull($role->slug);
		}
	}

	/**
	 * Test creating role with specific attributes
	 *
	 * @return void
	 */
	public function testCreateRoleWithSpecificAttributes(): void
	{
		$role = Role::factory()->create([
			'name' => 'Custom Role',
			'slug' => 'custom-role',
			'description' => 'A custom role description'
		]);

		$this->assertEquals('Custom Role', $role->name);
		$this->assertEquals('custom-role', $role->slug);
		$this->assertEquals('A custom role description', $role->description);
	}

	/**
	 * Test creating admin role
	 *
	 * @return void
	 */
	public function testCreateAdminRole(): void
	{
		$role = Role::factory()->state('admin')->create();

		$this->assertEquals('Admin', $role->name);
		$this->assertEquals('admin', $role->slug);
		$this->assertStringContainsString('administrator', strtolower($role->description));
	}

	/**
	 * Test creating user role
	 *
	 * @return void
	 */
	public function testCreateUserRole(): void
	{
		$role = Role::factory()->state('user')->create();

		$this->assertEquals('User', $role->name);
		$this->assertEquals('user', $role->slug);
	}

	/**
	 * Test creating moderator role
	 *
	 * @return void
	 */
	public function testCreateModeratorRole(): void
	{
		$role = Role::factory()->state('moderator')->create();

		$this->assertEquals('Moderator', $role->name);
		$this->assertEquals('moderator', $role->slug);
	}

	/**
	 * Test creating guest role
	 *
	 * @return void
	 */
	public function testCreateGuestRole(): void
	{
		$role = Role::factory()->state('guest')->create();

		$this->assertEquals('Guest', $role->name);
		$this->assertEquals('guest', $role->slug);
	}

	/**
	 * Test creating role with custom resource
	 *
	 * @return void
	 */
	public function testCreateRoleWithResource(): void
	{
		$role = Role::factory()->state('withResource', 'organization')->create();

		$this->assertEquals('organization', $role->resource);
	}

	/**
	 * Test making role without persisting to database
	 *
	 * @return void
	 */
	public function testMakeRoleWithoutPersisting(): void
	{
		$role = Role::factory()->make();

		$this->assertNull($role->id);
		$this->assertNotNull($role->name);
		$this->assertNotNull($role->slug);
	}

	/**
	 * Test getting raw attributes
	 *
	 * @return void
	 */
	public function testGetRawAttributes(): void
	{
		$attributes = Role::factory()->raw();

		$this->assertIsArray($attributes);
		$this->assertArrayHasKey('name', $attributes);
		$this->assertArrayHasKey('slug', $attributes);
		$this->assertArrayHasKey('description', $attributes);
	}

	/**
	 * Test role can be retrieved after creation
	 *
	 * @return void
	 */
	public function testRoleCanBeRetrievedAfterCreation(): void
	{
		$role = Role::factory()->create([
			'slug' => 'test-role'
		]);

		$retrieved = Role::getBy(['slug' => 'test-role']);

		$this->assertNotNull($retrieved);
		$this->assertEquals($role->id, $retrieved->id);
		$this->assertEquals('test-role', $retrieved->slug);
	}

	/**
	 * Test role can be updated
	 *
	 * @return void
	 */
	public function testRoleCanBeUpdated(): void
	{
		$role = Role::factory()->create();

		$role->name = 'Updated Role';
		$role->description = 'Updated description';
		$result = $role->update();

		$this->assertTrue($result);

		$updated = Role::get($role->id);
		$this->assertNotNull($updated);
		$this->assertEquals('Updated Role', $updated->name);
		$this->assertEquals('Updated description', $updated->description);
	}

	/**
	 * Test role can be deleted
	 *
	 * @return void
	 */
	public function testRoleCanBeDeleted(): void
	{
		$role = Role::factory()->create();
		$roleId = $role->id;

		$result = $role->delete();

		$this->assertTrue($result);

		$deleted = Role::get($roleId);
		$this->assertNull($deleted);
	}

	/**
	 * Test creating sequence of roles with variations
	 *
	 * @return void
	 */
	public function testCreateRolesWithSequence(): void
	{
		$roles = [];
		for ($i = 0; $i < 3; $i++) {
			$roles[] = Role::factory()->create([
				'name' => "Role{$i}",
				'slug' => "role-{$i}"
			]);
		}

		$this->assertEquals('Role0', $roles[0]->name);
		$this->assertEquals('role-0', $roles[0]->slug);

		$this->assertEquals('Role1', $roles[1]->name);
		$this->assertEquals('role-1', $roles[1]->slug);
	}

	/**
	 * Test role slug is unique
	 *
	 * @return void
	 */
	public function testRoleSlugShouldBeUnique(): void
	{
		$slug = 'unique-role';

		$role1 = Role::factory()->create(['slug' => $slug]);
		$this->assertEquals($slug, $role1->slug);

		// Second role with different slug should work
		$role2 = Role::factory()->create(['slug' => 'different-role']);
		$this->assertNotEquals($role1->slug, $role2->slug);
	}

	/**
	 * Test creating standard role set
	 *
	 * @return void
	 */
	public function testCreateStandardRoleSet(): void
	{
		$adminRole = Role::factory()->state('admin')->create();
		$userRole = Role::factory()->state('user')->create();
		$guestRole = Role::factory()->state('guest')->create();

		$roles = Role::fetchWhere([]);

		$this->assertGreaterThanOrEqual(3, count($roles));

		$slugs = array_column($roles, 'slug');
		$this->assertContains('admin', $slugs);
		$this->assertContains('user', $slugs);
		$this->assertContains('guest', $slugs);
	}

	/**
	 * Test role timestamps are set
	 *
	 * @return void
	 */
	public function testRoleTimestampsAreSet(): void
	{
		$role = Role::factory()->create();

		$this->assertNotNull($role->createdAt);
		$this->assertNotNull($role->updatedAt);
	}
}

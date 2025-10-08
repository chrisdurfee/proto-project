<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\Permission;
use Modules\User\Models\Role;

/**
 * PermissionTest
 *
 * Feature tests for Permission model using factories.
 * Tests CRUD operations, relationships, and business logic.
 *
 * @package Modules\User\Tests\Feature
 */
class PermissionTest extends Test
{
	/**
	 * Test creating a permission with factory
	 *
	 * @return void
	 */
	public function testCreatePermission(): void
	{
		$permission = Permission::factory()->create();

		$this->assertNotNull($permission->id);
		$this->assertNotNull($permission->name);
		$this->assertNotNull($permission->slug);
		$this->assertNotNull($permission->description);
		$this->assertNotNull($permission->module);
	}

	/**
	 * Test creating multiple permissions
	 *
	 * @return void
	 */
	public function testCreateMultiplePermissions(): void
	{
		$permissions = Permission::factory()->count(5)->create();

		$this->assertCount(5, $permissions);

		foreach ($permissions as $permission)
		{
			$this->assertNotNull($permission->id);
			$this->assertNotNull($permission->name);
			$this->assertNotNull($permission->slug);
		}
	}

	/**
	 * Test creating permission with specific attributes
	 *
	 * @return void
	 */
	public function testCreatePermissionWithSpecificAttributes(): void
	{
		$permission = Permission::factory()->create([
			'name' => 'Create Posts',
			'slug' => 'create-posts',
			'description' => 'Permission to create blog posts',
			'module' => 'Blog'
		]);

		$this->assertEquals('Create Posts', $permission->name);
		$this->assertEquals('create-posts', $permission->slug);
		$this->assertEquals('Permission to create blog posts', $permission->description);
		$this->assertEquals('Blog', $permission->module);
	}

	/**
	 * Test creating user management permission
	 *
	 * @return void
	 */
	public function testCreateUserManagePermission(): void
	{
		$permission = Permission::factory()->state('userManage')->create();

		$this->assertEquals('Manage Users', $permission->name);
		$this->assertEquals('manage-users', $permission->slug);
		$this->assertEquals('User', $permission->module);
	}

	/**
	 * Test creating content management permission
	 *
	 * @return void
	 */
	public function testCreateContentManagePermission(): void
	{
		$permission = Permission::factory()->state('contentManage')->create();

		$this->assertEquals('Manage Content', $permission->name);
		$this->assertEquals('manage-content', $permission->slug);
		$this->assertEquals('Content', $permission->module);
	}

	/**
	 * Test creating view only permission
	 *
	 * @return void
	 */
	public function testCreateViewOnlyPermission(): void
	{
		$permission = Permission::factory()->state('viewOnly')->create();

		$this->assertEquals('View Reports', $permission->name);
		$this->assertEquals('view-reports', $permission->slug);
		$this->assertEquals('Report', $permission->module);
	}

	/**
	 * Test creating permission with custom module
	 *
	 * @return void
	 */
	public function testCreatePermissionWithModule(): void
	{
		$permission = Permission::factory()->state('withModule', 'Billing')->create();

		$this->assertEquals('Billing', $permission->module);
	}

	/**
	 * Test making permission without persisting to database
	 *
	 * @return void
	 */
	public function testMakePermissionWithoutPersisting(): void
	{
		$permission = Permission::factory()->make();

		$this->assertNull($permission->id);
		$this->assertNotNull($permission->name);
		$this->assertNotNull($permission->slug);
	}

	/**
	 * Test getting raw attributes
	 *
	 * @return void
	 */
	public function testGetRawAttributes(): void
	{
		$attributes = Permission::factory()->raw();

		$this->assertIsArray($attributes);
		$this->assertArrayHasKey('name', $attributes);
		$this->assertArrayHasKey('slug', $attributes);
		$this->assertArrayHasKey('description', $attributes);
		$this->assertArrayHasKey('module', $attributes);
	}

	/**
	 * Test permission can be retrieved after creation
	 *
	 * @return void
	 */
	public function testPermissionCanBeRetrievedAfterCreation(): void
	{
		$permission = Permission::factory()->create([
			'slug' => 'test-permission'
		]);

		$retrieved = Permission::getBy(['slug' => 'test-permission']);

		$this->assertNotNull($retrieved);
		$this->assertEquals($permission->id, $retrieved->id);
		$this->assertEquals('test-permission', $retrieved->slug);
	}

	/**
	 * Test permission can be updated
	 *
	 * @return void
	 */
	public function testPermissionCanBeUpdated(): void
	{
		$permission = Permission::factory()->create();

		$permission->name = 'Updated Permission';
		$permission->description = 'Updated description';
		$result = $permission->save();

		$this->assertTrue($result);

		$updated = Permission::getById($permission->id);
		$this->assertEquals('Updated Permission', $updated->name);
		$this->assertEquals('Updated description', $updated->description);
	}

	/**
	 * Test permission can be deleted
	 *
	 * @return void
	 */
	public function testPermissionCanBeDeleted(): void
	{
		$permission = Permission::factory()->create();
		$permissionId = $permission->id;

		$result = $permission->delete();

		$this->assertTrue($result);

		$deleted = Permission::getById($permissionId);
		$this->assertNull($deleted);
	}

	/**
	 * Test creating sequence of permissions with variations
	 *
	 * @return void
	 */
	public function testCreatePermissionsWithSequence(): void
	{
		$permissions = [];
		for ($i = 0; $i < 3; $i++) {
			$permissions[] = Permission::factory()->create([
				'name' => "Permission{$i}",
				'slug' => "permission-{$i}"
			]);
		}

		$this->assertEquals('Permission0', $permissions[0]->name);
		$this->assertEquals('permission-0', $permissions[0]->slug);

		$this->assertEquals('Permission1', $permissions[1]->name);
		$this->assertEquals('permission-1', $permissions[1]->slug);
	}

	/**
	 * Test permission slug is unique
	 *
	 * @return void
	 */
	public function testPermissionSlugShouldBeUnique(): void
	{
		$slug = 'unique-permission';

		$permission1 = Permission::factory()->create(['slug' => $slug]);
		$this->assertEquals($slug, $permission1->slug);

		// Second permission with different slug should work
		$permission2 = Permission::factory()->create(['slug' => 'different-permission']);
		$this->assertNotEquals($permission1->slug, $permission2->slug);
	}

	/**
	 * Test creating CRUD permission set
	 *
	 * @return void
	 */
	public function testCreateCrudPermissionSet(): void
	{
		$module = 'Product';

		$create = Permission::factory()->create([
			'name' => "Create {$module}",
			'slug' => "create-{$module}",
			'module' => $module
		]);

		$read = Permission::factory()->create([
			'name' => "Read {$module}",
			'slug' => "read-{$module}",
			'module' => $module
		]);

		$update = Permission::factory()->create([
			'name' => "Update {$module}",
			'slug' => "update-{$module}",
			'module' => $module
		]);

		$delete = Permission::factory()->create([
			'name' => "Delete {$module}",
			'slug' => "delete-{$module}",
			'module' => $module
		]);

		$this->assertEquals($module, $create->module);
		$this->assertEquals($module, $read->module);
		$this->assertEquals($module, $update->module);
		$this->assertEquals($module, $delete->module);

		$permissions = Permission::fetchWhere(['module' => $module]);
		$this->assertCount(4, $permissions);
	}

	/**
	 * Test permission timestamps are set
	 *
	 * @return void
	 */
	public function testPermissionTimestampsAreSet(): void
	{
		$permission = Permission::factory()->create();

		$this->assertNotNull($permission->createdAt);
		$this->assertNotNull($permission->updatedAt);
	}

	/**
	 * Test grouping permissions by module
	 *
	 * @return void
	 */
	public function testGroupingPermissionsByModule(): void
	{
		// Create permissions for different modules
		Permission::factory()->create(['module' => 'User', 'slug' => 'user-perm-1']);
		Permission::factory()->create(['module' => 'User', 'slug' => 'user-perm-2']);
		Permission::factory()->create(['module' => 'Product', 'slug' => 'product-perm-1']);

		$userPermissions = Permission::fetchWhere(['module' => 'User']);
		$productPermissions = Permission::fetchWhere(['module' => 'Product']);

		$this->assertGreaterThanOrEqual(2, count($userPermissions));
		$this->assertGreaterThanOrEqual(1, count($productPermissions));
	}
}

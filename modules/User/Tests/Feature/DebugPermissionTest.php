<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\Permission;

/**
 * DebugPermissionTest
 *
 * Diagnostic test to debug factory issues in CI.
 *
 * @package Modules\User\Tests\Feature
 */
class DebugPermissionTest extends Test
{
	/**
	 * Test database connection works
	 *
	 * @return void
	 */
	public function testDatabaseConnectionWorks(): void
	{
		$db = $this->getTestDatabase();
		$result = $db->first('SELECT 1 as test');

		$this->assertNotNull($result);
		$this->assertEquals(1, $result->test);
	}

	/**
	 * Test permissions table exists
	 *
	 * @return void
	 */
	public function testPermissionsTableExists(): void
	{
		$db = $this->getTestDatabase();
		$result = $db->first('SHOW TABLES LIKE "permissions"');

		$this->assertNotNull($result, 'Permissions table should exist');
	}

	/**
	 * Test manual insert into permissions table
	 *
	 * @return void
	 */
	public function testManualInsertWorks(): void
	{
		$db = $this->getTestDatabase();

		$sql = "INSERT INTO permissions (name, slug, description, module, created_at, updated_at)
		        VALUES (?, ?, ?, ?, ?, ?)";

		$params = [
			'Test Permission',
			'test-permission',
			'Test Description',
			'Test',
			date('Y-m-d H:i:s'),
			date('Y-m-d H:i:s')
		];

		$result = $db->execute($sql, $params);
		$this->assertTrue($result, 'Manual insert should succeed');

		// Verify it was inserted
		$insertedId = $db->getLastId();
		$this->assertGreaterThan(0, $insertedId, 'Should have an insert ID');

		// Retrieve it
		$retrieved = $db->first('SELECT * FROM permissions WHERE id = ?', [$insertedId]);
		$this->assertNotNull($retrieved, 'Should be able to retrieve inserted record');
		$this->assertEquals('Test Permission', $retrieved->name);
	}

	/**
	 * Test factory definition returns proper data
	 *
	 * @return void
	 */
	public function testFactoryDefinitionIsValid(): void
	{
		$factory = Permission::factory();
		$attributes = $factory->raw();

		$this->assertIsArray($attributes);
		$this->assertArrayHasKey('name', $attributes);
		$this->assertArrayHasKey('slug', $attributes);
		$this->assertArrayHasKey('description', $attributes);
		$this->assertArrayHasKey('module', $attributes);
		$this->assertArrayNotHasKey('resource', $attributes, 'resource field should not exist');

		// All required fields should have values
		$this->assertNotNull($attributes['name']);
		$this->assertNotNull($attributes['slug']);
		$this->assertNotNull($attributes['module']);
	}

	/**
	 * Test model can be created manually
	 *
	 * @return void
	 */
	public function testModelCanBeCreatedManually(): void
	{
		$permission = new Permission();
		$permission->name = 'Manual Test';
		$permission->slug = 'manual-test';
		$permission->description = 'Manual Test Description';
		$permission->module = 'Test';
		$permission->createdAt = date('Y-m-d H:i:s');
		$permission->updatedAt = date('Y-m-d H:i:s');

		$result = $permission->add();
		$this->assertTrue($result, 'Model add() should return true. Error: ' . ($permission->storage->getLastError() ?? 'none'));

		$this->assertNotNull($permission->id, 'Permission ID should be set after add()');
		$this->assertGreaterThan(0, $permission->id, 'Permission ID should be positive');

		// Verify we can retrieve it
		$retrieved = Permission::get($permission->id);
		$this->assertNotNull($retrieved);
		$this->assertEquals('Manual Test', $retrieved->name);
	}

	/**
	 * Test factory make (without persisting)
	 *
	 * @return void
	 */
	public function testFactoryMakeCreatesModelWithoutPersisting(): void
	{
		$permission = Permission::factory()->make();

		$this->assertInstanceOf(Permission::class, $permission);
		$this->assertNull($permission->id, 'ID should be null for unpersisted model');
		$this->assertNotNull($permission->name, 'Name should be set');
		$this->assertNotNull($permission->slug, 'Slug should be set');
	}
}

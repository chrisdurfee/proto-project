<?php declare(strict_types=1);
namespace Modules\User\Role\Models\Factories;

use Proto\Models\Factory;
use Modules\User\Role\Models\Role;

/**
 * RoleFactory
 *
 * Factory for generating Role model test data.
 *
 * @package Modules\User\Factories
 */
class RoleFactory extends Factory
{
	/**
	 * The model this factory creates
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Role::class;
	}

	/**
	 * Define the model's default state
	 *
	 * @return array
	 */
	public function definition(): array
	{
		$words = ['Admin', 'User', 'Manager', 'Editor', 'Viewer', 'Moderator', 'Guest'];
		$resources = ['global', 'organization', 'group', 'team'];
		$name = $words[$this->faker()->numberBetween(0, count($words) - 1)];
		$uniqueId = $this->faker()->numberBetween(1000, 9999);

		return [
			'name' => $name,
			'slug' => strtolower($name . '-' . $uniqueId),
			'description' => $this->faker()->text(10),
			'resource' => $resources[$this->faker()->numberBetween(0, count($resources) - 1)],
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		];
	}

	/**
	 * Define an admin role state
	 *
	 * @return static
	 */
	public function stateAdmin(): static
	{
		return $this->state(fn() => [
			'name' => 'Admin',
			'slug' => 'admin',
			'description' => 'System administrator with full access'
		]);
	}

	/**
	 * Define a user role state
	 *
	 * @return static
	 */
	public function stateUser(): static
	{
		return $this->state(fn() => [
			'name' => 'User',
			'slug' => 'user',
			'description' => 'Standard user with basic access'
		]);
	}

	/**
	 * Define a moderator role state
	 *
	 * @return static
	 */
	public function stateModerator(): static
	{
		return $this->state(fn() => [
			'name' => 'Moderator',
			'slug' => 'moderator',
			'description' => 'Content moderator with limited administrative access'
		]);
	}

	/**
	 * Define a guest role state
	 *
	 * @return static
	 */
	public function stateGuest(): static
	{
		return $this->state(fn() => [
			'name' => 'Guest',
			'slug' => 'guest',
			'description' => 'Guest user with read-only access'
		]);
	}

	/**
	 * State with custom resource
	 *
	 * @param string $resource
	 * @return static
	 */
	public function stateWithResource(string $resource): static
	{
		return $this->state(fn() => [
			'resource' => $resource
		]);
	}
}

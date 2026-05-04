<?php declare(strict_types=1);
namespace Modules\Client\Contact\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Contact\Models\ClientContact;

/**
 * ClientContactFactory
 *
 * @package Modules\Client\Contact\Models\Factories
 */
class ClientContactFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ClientContact::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'clientId' => 1,
			'userId' => 1,
			'contactType' => $this->faker()->randomElement(['primary', 'billing', 'technical', 'emergency', 'sales', 'support']),
			'contactStatus' => 'active',
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a primary contact.
	 *
	 * @return static
	 */
	public function primary(): static
	{
		return $this->state(fn() => ['contactType' => 'primary']);
	}

	/**
	 * Create an inactive contact.
	 *
	 * @return static
	 */
	public function inactive(): static
	{
		return $this->state(fn() => ['contactStatus' => 'inactive']);
	}
}

<?php declare(strict_types=1);
namespace Modules\Client\Main\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Main\Models\Client;

/**
 * ClientFactory
 *
 * @package Modules\Client\Main\Models\Factories
 */
class ClientFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Client::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'companyName' => $this->faker()->company(),
			'clientType' => 'individual',
			'clientNumber' => 'CLT-' . $this->faker()->numberBetween(10000, 99999),
			'website' => $this->faker()->url(),
			'industry' => $this->faker()->word(),
			'street1' => $this->faker()->streetAddress(),
			'city' => $this->faker()->city(),
			'state' => $this->faker()->stateAbbr(),
			'postalCode' => $this->faker()->postcode(),
			'country' => 'US',
			'status' => 'prospect',
			'priority' => 'medium',
			'currency' => 'USD',
			'totalRevenue' => 0,
			'outstandingBalance' => 0,
			'assignedTo' => 1,
			'createdByUserId' => 1,
			'language' => 'en',
			'timezone' => 'America/New_York',
			'marketingOptIn' => 0,
			'newsletterSubscribed' => 0,
			'isVip' => 0,
			'doNotContact' => 0,
			'emailBounced' => 0,
			'verified' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a business client.
	 *
	 * @return static
	 */
	public function business(): static
	{
		return $this->state(fn() => ['clientType' => 'business']);
	}

	/**
	 * Create an enterprise client.
	 *
	 * @return static
	 */
	public function enterprise(): static
	{
		return $this->state(fn() => ['clientType' => 'enterprise']);
	}

	/**
	 * Create an active customer.
	 *
	 * @return static
	 */
	public function active(): static
	{
		return $this->state(fn() => ['status' => 'active']);
	}

	/**
	 * Create a VIP client.
	 *
	 * @return static
	 */
	public function vip(): static
	{
		return $this->state(fn() => ['isVip' => 1, 'priority' => 'high']);
	}
}

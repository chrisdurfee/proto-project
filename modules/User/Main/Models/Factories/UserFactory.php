<?php declare(strict_types=1);
namespace Modules\User\Main\Models\Factories;

use Proto\Models\Factory;
use Modules\User\Main\Models\User;

/**
 * UserFactory
 *
 * Factory for generating User model test data.
 *
 * @package Modules\User\Factories
 */
class UserFactory extends Factory
{
	/**
	 * Factory constructor.
	 *
	 * @param int $count
	 * @param array $attributes
	 */
	public function __construct(int $count = 1, array $attributes = [])
	{
		parent::__construct($count, $attributes);
	}

	/**
	 * The model this factory creates
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return User::class;
	}

	/**
	 * Define the model's default state
	 *
	 * @return array
	 */
	public function definition(): array
	{
		$num = $this->faker()->numberBetween(1, 999999);

		return [
			'uuid' => $this->faker()->uuid(),
			'username' => 'user' . $num,
			'email' => 'user' . $num . '@example.com',
			'password' => password_hash('password', PASSWORD_BCRYPT),
			'firstName' => 'Test',
			'lastName' => 'User',
			'displayName' => 'Test User',
			'status' => 'offline',
			'enabled' => 1,
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		];
	}

	/**
	 * Define an admin user state
	 *
	 * @return static
	 */
	public function stateAdmin(): static
	{
		return $this->state(fn() => [
			'status' => 'online',
			'enabled' => 1,
			'emailVerifiedAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * Define a verified user state
	 *
	 * @return static
	 */
	public function stateVerified(): static
	{
		return $this->state(fn() => [
			'emailVerifiedAt' => date('Y-m-d H:i:s'),
			'verified' => 1
		]);
	}

	/**
	 * Define an unverified user state
	 *
	 * @return static
	 */
	public function stateUnverified(): static
	{
		return $this->state(fn() => [
			'emailVerifiedAt' => null,
			'verified' => 0
		]);
	}

	/**
	 * Define a disabled user state
	 *
	 * @return static
	 */
	public function stateDisabled(): static
	{
		return $this->state(fn() => [
			'enabled' => 0,
			'status' => 'offline'
		]);
	}

	/**
	 * Define a trial mode user state
	 *
	 * @return static
	 */
	public function stateTrial(): static
	{
		return $this->state(fn() => [
			'trialMode' => true,
			'trialDaysLeft' => $this->faker()->numberBetween(1, 30)
		]);
	}

	/**
	 * Define a user with MFA enabled
	 *
	 * @return static
	 */
	public function stateMfaEnabled(): static
	{
		return $this->state(fn() => [
			'multiFactorEnabled' => true
		]);
	}

	/**
	 * Define a user with complete profile
	 *
	 * @return static
	 */
	public function stateCompleteProfile(): static
	{
		$streets = ['Main St', 'Oak Ave', 'Elm Street', 'Park Blvd', 'Maple Dr'];
		$cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
		$genders = ['male', 'female', 'other'];

		return $this->state(fn() => [
			'image' => 'https://via.placeholder.com/150',
			'coverImageUrl' => 'https://via.placeholder.com/800x200',
			'bio' => $this->faker()->text(200),
			'dob' => date('Y-m-d', strtotime('-' . $this->faker()->numberBetween(18, 60) . ' years')),
			'gender' => $genders[$this->faker()->numberBetween(0, 2)],
			'street1' => $this->faker()->numberBetween(100, 9999) . ' ' . $streets[$this->faker()->numberBetween(0, 4)],
			'city' => $cities[$this->faker()->numberBetween(0, 4)],
			'state' => ['CA', 'NY', 'TX', 'FL', 'IL'][$this->faker()->numberBetween(0, 4)],
			'postalCode' => sprintf('%05d', $this->faker()->numberBetween(10000, 99999))
		]);
	}

	/**
	 * State with custom domain for email
	 *
	 * @param string $domain
	 * @return static
	 */
	public function stateWithDomain(string $domain): static
	{
		$firstName = $this->faker()->firstName();
		$lastName = $this->faker()->lastName();
		$username = strtolower($firstName . '.' . $lastName . $this->faker()->numberBetween(1, 999));

		return $this->state(fn() => [
			'email' => $username . '@' . $domain
		]);
	}
}

<?php declare(strict_types=1);
namespace Modules\User\Models\Factories;

use Proto\Models\Factory;
use Modules\User\Models\User;

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
		$firstName = $this->faker()->firstName();
		$lastName = $this->faker()->lastName();
		$username = strtolower($firstName . $lastName . $this->faker()->numberBetween(1, 999));

		return [
			'uuid' => $this->faker()->uuid(),
			'username' => $username,
			'email' => strtolower($firstName . '.' . $lastName . $this->faker()->numberBetween(1, 999)) . '@' . ['example.com', 'test.com', 'sample.org'][$this->faker()->numberBetween(0, 2)],
			'password' => password_hash('password', PASSWORD_BCRYPT),
			'firstName' => $firstName,
			'lastName' => $lastName,
			'displayName' => $firstName . ' ' . $lastName,
			'status' => 'offline',
			'enabled' => true,
			'multiFactorEnabled' => false,
			'emailVerifiedAt' => null,
			'marketingOptIn' => false,
			'acceptedTermsAt' => date('Y-m-d H:i:s'),
			'trialMode' => false,
			'trialDaysLeft' => 0,
			'timezone' => 'UTC',
			'language' => 'en',
			'currency' => 'USD',
			'country' => ['USA', 'Canada', 'UK', 'Australia', 'Germany'][$this->faker()->numberBetween(0, 4)],
			'followerCount' => 0,
			'followingCount' => 0,
			'verified' => false,
			'createdAt' => date('Y-m-d H:i:s'),
			'updatedAt' => date('Y-m-d H:i:s')
		];
	}

	/**
	 * Define an admin user state
	 *
	 * @return array
	 */
	public function stateAdmin(): array
	{
		return [
			'status' => 'online',
			'enabled' => true,
			'emailVerifiedAt' => date('Y-m-d H:i:s')
		];
	}

	/**
	 * Define a verified user state
	 *
	 * @return array
	 */
	public function stateVerified(): array
	{
		return [
			'emailVerifiedAt' => date('Y-m-d H:i:s'),
			'verified' => true
		];
	}

	/**
	 * Define an unverified user state
	 *
	 * @return array
	 */
	public function stateUnverified(): array
	{
		return [
			'emailVerifiedAt' => null,
			'verified' => false
		];
	}

	/**
	 * Define a disabled user state
	 *
	 * @return array
	 */
	public function stateDisabled(): array
	{
		return [
			'enabled' => false,
			'status' => 'offline'
		];
	}

	/**
	 * Define a trial mode user state
	 *
	 * @return array
	 */
	public function stateTrial(): array
	{
		return [
			'trialMode' => true,
			'trialDaysLeft' => $this->faker()->numberBetween(1, 30)
		];
	}

	/**
	 * Define a user with MFA enabled
	 *
	 * @return array
	 */
	public function stateMfaEnabled(): array
	{
		return [
			'multiFactorEnabled' => true
		];
	}

	/**
	 * Define a user with complete profile
	 *
	 * @return array
	 */
	public function stateCompleteProfile(): array
	{
		$streets = ['Main St', 'Oak Ave', 'Elm Street', 'Park Blvd', 'Maple Dr'];
		$cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
		$genders = ['male', 'female', 'other'];

		return [
			'image' => 'https://via.placeholder.com/150',
			'coverImageUrl' => 'https://via.placeholder.com/800x200',
			'bio' => $this->faker()->text(200),
			'dob' => date('Y-m-d', strtotime('-' . $this->faker()->numberBetween(18, 60) . ' years')),
			'gender' => $genders[$this->faker()->numberBetween(0, 2)],
			'street1' => $this->faker()->numberBetween(100, 9999) . ' ' . $streets[$this->faker()->numberBetween(0, 4)],
			'city' => $cities[$this->faker()->numberBetween(0, 4)],
			'state' => ['CA', 'NY', 'TX', 'FL', 'IL'][$this->faker()->numberBetween(0, 4)],
			'postalCode' => sprintf('%05d', $this->faker()->numberBetween(10000, 99999))
		];
	}

	/**
	 * State with custom domain for email
	 *
	 * @param string $domain
	 * @return array
	 */
	public function stateWithDomain(string $domain): array
	{
		$firstName = $this->faker()->firstName();
		$lastName = $this->faker()->lastName();
		$username = strtolower($firstName . '.' . $lastName . $this->faker()->numberBetween(1, 999));

		return [
			'email' => $username . '@' . $domain
		];
	}
}

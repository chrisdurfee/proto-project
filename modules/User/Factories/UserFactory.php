<?php declare(strict_types=1);
namespace Modules\User\Factories;

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
		return [
			'uuid' => $this->faker()->uuid(),
			'username' => $this->faker()->unique()->userName(),
			'email' => $this->faker()->unique()->email(),
			'password' => password_hash('password', PASSWORD_BCRYPT),
			'firstName' => $this->faker()->firstName(),
			'lastName' => $this->faker()->lastName(),
			'displayName' => $this->faker()->name(),
			'status' => 'active',
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
			'country' => $this->faker()->country(),
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
			'status' => 'active',
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
			'status' => 'disabled'
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
		return [
			'image' => $this->faker()->imageUrl(200, 200, 'people'),
			'coverImageUrl' => $this->faker()->imageUrl(800, 200, 'nature'),
			'bio' => $this->faker()->paragraph(),
			'dob' => $this->faker()->date('Y-m-d', '-18 years'),
			'gender' => $this->faker()->randomElement(['male', 'female', 'other']),
			'street1' => $this->faker()->streetAddress(),
			'city' => $this->faker()->city(),
			'state' => $this->faker()->state(),
			'postalCode' => $this->faker()->postcode()
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
		return [
			'email' => $this->faker()->unique()->userName() . "@{$domain}"
		];
	}
}

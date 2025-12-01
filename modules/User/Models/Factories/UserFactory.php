<?php declare(strict_types=1);
namespace Modules\User\Models\Factories;

use Proto\Models\Factory;
use Modules\User\Models\User;
use Modules\User\Models\NotificationPreference;

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
	 * Sets up the afterCreating hook to auto-create notification preferences.
	 * Uses Proto 1.0.157+ fixed connection caching to ensure same transaction.
	 *
	 * @param int $count
	 * @param array $attributes
	 */
	public function __construct(int $count = 1, array $attributes = [])
	{
		parent::__construct($count, $attributes);
		
		// Set afterCreating callback to create notification preferences
		// This ensures the User model's eager-loaded NotificationPreference join returns data
		$this->afterCreating = function (User $user) {
			$preference = new NotificationPreference();
			$preference->userId = $user->id;
			$preference->allowEmail = 1;
			$preference->allowSms = 1;
			$preference->allowPush = 1;
			$preference->createdAt = date('Y-m-d H:i:s');
			$preference->updatedAt = date('Y-m-d H:i:s');
			$preference->create();
		};
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
	 * @return array
	 */
	public function stateAdmin(): array
	{
		return [
			'status' => 'online',
			'enabled' => 1,
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
			'verified' => 1
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
			'verified' => 0
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
			'enabled' => 0,
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

<?php declare(strict_types=1);
namespace Modules\Client\Call\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Call\Models\ClientCall;

/**
 * ClientCallFactory
 *
 * @package Modules\Client\Call\Models\Factories
 */
class ClientCallFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ClientCall::class;
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
			'callType' => $this->faker()->randomElement(['inbound', 'outbound', 'scheduled', 'follow_up']),
			'callStatus' => 'completed',
			'subject' => $this->faker()->sentence(4),
			'duration' => $this->faker()->numberBetween(30, 3600),
			'priority' => 'medium',
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a scheduled call.
	 *
	 * @return static
	 */
	public function scheduled(): static
	{
		return $this->state(fn() => [
			'callType' => 'scheduled',
			'callStatus' => 'scheduled',
			'scheduledAt' => $this->faker()->dateTimeBetween('now', '+7 days'),
		]);
	}

	/**
	 * Create a missed call.
	 *
	 * @return static
	 */
	public function missed(): static
	{
		return $this->state(fn() => [
			'callStatus' => 'missed',
			'duration' => 0,
		]);
	}

	/**
	 * Create a call with an outcome.
	 *
	 * @return static
	 */
	public function withOutcome(): static
	{
		return $this->state(fn() => [
			'outcome' => $this->faker()->randomElement(['successful', 'follow_up_needed', 'no_answer', 'voicemail', 'callback_requested', 'resolved']),
		]);
	}
}

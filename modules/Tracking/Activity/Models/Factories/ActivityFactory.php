<?php declare(strict_types=1);
namespace Modules\Tracking\Activity\Models\Factories;

use Proto\Models\Factory;
use Modules\Tracking\Activity\Models\Activity;

/**
 * ActivityFactory
 *
 * @package Modules\Tracking\Activity\Models\Factories
 */
class ActivityFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Activity::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'type' => $this->faker()->randomElement(['client', 'ticket', 'message']),
			'userId' => 1,
			'refId' => $this->faker()->numberBetween(1, 1000),
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a client activity.
	 *
	 * @return static
	 */
	public function client(): static
	{
		return $this->state(fn() => ['type' => 'client']);
	}

	/**
	 * Create a ticket activity.
	 *
	 * @return static
	 */
	public function ticket(): static
	{
		return $this->state(fn() => ['type' => 'ticket']);
	}

	/**
	 * Create a message activity.
	 *
	 * @return static
	 */
	public function message(): static
	{
		return $this->state(fn() => ['type' => 'message']);
	}
}

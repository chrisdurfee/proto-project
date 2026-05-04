<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Models\Factories;

use Proto\Models\Factory;
use Modules\Tracking\Signals\Models\TrackingSignal;
use Modules\Tracking\Signals\Signals\SignalType;

/**
 * TrackingSignalFactory
 *
 * @package Modules\Tracking\Signals\Models\Factories
 */
class TrackingSignalFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return TrackingSignal::class;
	}

	/**
	 * Define default attribute values.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		$types = [
			SignalType::ONBOARDING_STARTED,
			SignalType::ONBOARDING_STEP_COMPLETED,
			SignalType::ONBOARDING_COMPLETED,
			SignalType::PREFERENCE_UPDATED,
			SignalType::GARAGE_VEHICLE_ADDED,
		];

		return [
			'userId' => 1,
			'type' => $this->faker()->randomElement($types),
			'metadata' => null,
			'occurredAt' => $this->faker()->dateTimeBetween('-30 days', 'now'),
		];
	}
}

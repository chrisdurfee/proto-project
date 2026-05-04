<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Main\Models\User;
use Modules\Tracking\Signals\Models\TrackingSignal;
use Modules\Tracking\Signals\Services\SignalService;
use Modules\Tracking\Signals\Signals\SignalType;

/**
 * TrackingSignalTest
 *
 * Feature tests for the Tracking/Signals recording service.
 *
 * @package Modules\Tracking\Signals\Tests\Feature
 */
class TrackingSignalTest extends Test
{
	/**
	 * @var SignalService $service
	 */
	private SignalService $service;

	/**
	 * @return void
	 */
	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new SignalService();
	}

	/**
	 * Test that record() persists a TrackingSignal row.
	 *
	 * @return void
	 */
	public function testRecordPersistsSignal(): void
	{
		$user = User::factory()->create();

		$this->service->record(
			$user->id,
			SignalType::ONBOARDING_STARTED,
			['version' => '1.0']
		);

		$this->assertDatabaseHas('tracking_signals', [
			'userId' => $user->id,
			'type' => SignalType::ONBOARDING_STARTED,
		]);
	}

	/**
	 * Test that record() works without a userId (anonymous signal).
	 *
	 * @return void
	 */
	public function testRecordAnonymousSignal(): void
	{
		$this->service->record(
			null,
			SignalType::ONBOARDING_STARTED
		);

		$this->assertDatabaseHas('tracking_signals', [
			'type' => SignalType::ONBOARDING_STARTED,
		]);
	}

	/**
	 * Test getForUser() returns signals for a specific user.
	 *
	 * @return void
	 */
	public function testGetForUserReturnsUserSignals(): void
	{
		$user = User::factory()->create();

		$this->service->record($user->id, SignalType::ONBOARDING_STARTED);
		$this->service->record($user->id, SignalType::PREFERENCE_UPDATED);

		$signals = $this->service->getForUser($user->id);

		$this->assertCount(2, $signals);
		foreach ($signals as $signal)
		{
			$this->assertEquals($user->id, (int)$signal->userId);
		}
	}

	/**
	 * Test hasSignal() returns true when signal was recorded.
	 *
	 * @return void
	 */
	public function testHasSignalReturnsTrueWhenRecorded(): void
	{
		$user = User::factory()->create();
		$this->service->record($user->id, SignalType::ONBOARDING_COMPLETED);

		$this->assertTrue($this->service->hasSignal($user->id, SignalType::ONBOARDING_COMPLETED));
	}

	/**
	 * Test hasSignal() returns false when signal was not recorded.
	 *
	 * @return void
	 */
	public function testHasSignalReturnsFalseWhenNotRecorded(): void
	{
		$user = User::factory()->create();

		$this->assertFalse($this->service->hasSignal($user->id, SignalType::ONBOARDING_COMPLETED));
	}

	/**
	 * Test countByType() returns correct count.
	 *
	 * @return void
	 */
	public function testCountByType(): void
	{
		$user = User::factory()->create();

		$this->service->record($user->id, SignalType::PREFERENCE_UPDATED, ['field' => 'brands']);
		$this->service->record($user->id, SignalType::PREFERENCE_UPDATED, ['field' => 'interests']);
		$this->service->record($user->id, SignalType::ONBOARDING_STARTED);

		$count = $this->service->countByType($user->id, SignalType::PREFERENCE_UPDATED);

		$this->assertEquals(2, $count);
	}
}

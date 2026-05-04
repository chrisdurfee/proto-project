<?php declare(strict_types=1);

namespace Modules\Assistant\Personalization\Services;

use Common\Services\Service;
use Modules\User\Onboarding\Models\UserOnboardingSession;
use Modules\User\Preferences\Services\UserPreferencesService;

/**
 * PersonalizationService
 *
 * Generates contextual nudges that guide a user through the platform
 * based on their onboarding status and preference completeness.
 *
 * @package Modules\Assistant\Personalization\Services
 */
class PersonalizationService extends Service
{
	/**
	 * @var UserPreferencesService $preferencesService
	 */
	private UserPreferencesService $preferencesService;

	/**
	 * @return void
	 */
	public function __construct()
	{
		$this->preferencesService = new UserPreferencesService();
	}

	/**
	 * Return an ordered list of nudges for the given user.
	 *
	 * Each nudge has a type, title, message, and optional action object.
	 *
	 * @param int $userId
	 * @return array<object>
	 */
	public function getNudges(int $userId): array
	{
		$nudges = [];

		$this->addOnboardingNudge($userId, $nudges);
		$this->addBrandPreferenceNudge($userId, $nudges);
		$this->addVehicleTypeNudge($userId, $nudges);
		$this->addInterestNudge($userId, $nudges);
		$this->addLocationNudge($userId, $nudges);

		return $nudges;
	}

	/**
	 * Add a nudge if the user has not completed onboarding.
	 *
	 * @param int $userId
	 * @param array<object> $nudges
	 * @return void
	 */
	private function addOnboardingNudge(int $userId, array &$nudges): void
	{
		$session = UserOnboardingSession::getBy([['userId', $userId]]);
		if ($session && $session->status === 'completed')
		{
			return;
		}

		$nudges[] = (object)[
			'type' => 'onboarding',
			'priority' => 1,
			'title' => 'Welcome to Rally!',
			'message' => 'Complete a quick setup to personalise your experience.',
			'action' => (object)[
				'label' => 'Start Setup',
				'route' => 'onboarding',
			],
		];
	}

	/**
	 * Add a nudge if the user has no brand preferences.
	 *
	 * @param int $userId
	 * @param array<object> $nudges
	 * @return void
	 */
	private function addBrandPreferenceNudge(int $userId, array &$nudges): void
	{
		$brands = $this->preferencesService->getBrands($userId);
		if (!empty($brands))
		{
			return;
		}

		$nudges[] = (object)[
			'type' => 'preference.brands',
			'priority' => 2,
			'title' => 'Tell us your favorite brands',
			'message' => 'We\'ll surface content from the brands you love.',
			'action' => (object)[
				'label' => 'Add Brands',
				'route' => 'preferences/brands',
			],
		];
	}

	/**
	 * Add a nudge if the user has no vehicle-type preferences.
	 *
	 * @param int $userId
	 * @param array<object> $nudges
	 * @return void
	 */
	private function addVehicleTypeNudge(int $userId, array &$nudges): void
	{
		$types = $this->preferencesService->getVehicleTypes($userId);
		if (!empty($types))
		{
			return;
		}

		$nudges[] = (object)[
			'type' => 'preference.vehicle_types',
			'priority' => 3,
			'title' => 'What vehicles interest you?',
			'message' => 'Select vehicle types to see relevant content.',
			'action' => (object)[
				'label' => 'Choose Types',
				'route' => 'preferences/vehicle-types',
			],
		];
	}

	/**
	 * Add a nudge if the user has no interest preferences.
	 *
	 * @param int $userId
	 * @param array<object> $nudges
	 * @return void
	 */
	private function addInterestNudge(int $userId, array &$nudges): void
	{
		$interests = $this->preferencesService->getInterests($userId);
		if (!empty($interests))
		{
			return;
		}

		$nudges[] = (object)[
			'type' => 'preference.interests',
			'priority' => 4,
			'title' => 'What are your interests?',
			'message' => 'Pick topics so we can recommend events, groups, and posts.',
			'action' => (object)[
				'label' => 'Pick Interests',
				'route' => 'preferences/interests',
			],
		];
	}

	/**
	 * Add a nudge if the user has no location preference.
	 *
	 * @param int $userId
	 * @param array<object> $nudges
	 * @return void
	 */
	private function addLocationNudge(int $userId, array &$nudges): void
	{
		$location = $this->preferencesService->getLocation($userId);
		if ($location)
		{
			return;
		}

		$nudges[] = (object)[
			'type' => 'preference.location',
			'priority' => 5,
			'title' => 'Share your location',
			'message' => 'Find nearby events and rally groups.',
			'action' => (object)[
				'label' => 'Set Location',
				'route' => 'preferences/location',
			],
		];
	}
}

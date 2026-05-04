<?php declare(strict_types=1);

namespace Modules\Assistant\Personalization\Gateway;

use Modules\Assistant\Personalization\Services\PersonalizationService;

/**
 * Gateway
 *
 * Exposes personalization nudges to the module system.
 *
 * @package Modules\Assistant\Personalization\Gateway
 */
class Gateway
{
	/**
	 * @var PersonalizationService $service
	 */
	private PersonalizationService $service;

	/**
	 * @return void
	 */
	public function __construct()
	{
		$this->service = new PersonalizationService();
	}

	/**
	 * Get nudges for a user.
	 *
	 * @param int $userId
	 * @return array<object>
	 */
	public function getNudges(int $userId): array
	{
		return $this->service->getNudges($userId);
	}
}

<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Gateway;

use Modules\Tracking\Signals\Services\SignalService;

/**
 * Gateway
 *
 * Provides programmatic access to tracking signal operations.
 *
 * @package Modules\Tracking\Signals\Gateway
 */
class Gateway
{
	/**
	 * @var SignalService $service
	 */
	private SignalService $service;

	/**
	 * @return void
	 */
	public function __construct()
	{
		$this->service = new SignalService();
	}

	/**
	 * Record a signal.
	 *
	 * @param int|null $userId
	 * @param string $type
	 * @param array<string, mixed>|null $metadata
	 * @return void
	 */
	public function record(?int $userId, string $type, ?array $metadata = null): void
	{
		$this->service->record($userId, $type, $metadata);
	}

	/**
	 * Get signals for a user.
	 *
	 * @param int $userId
	 * @param string|null $type
	 * @param int $limit
	 * @return array<object>
	 */
	public function getForUser(int $userId, ?string $type = null, int $limit = 50): array
	{
		return $this->service->getForUser($userId, $type, $limit);
	}

	/**
	 * Check whether a signal of the given type has been recorded for a user.
	 *
	 * @param int $userId
	 * @param string $type
	 * @return bool
	 */
	public function hasSignal(int $userId, string $type): bool
	{
		return $this->service->hasSignal($userId, $type);
	}
}

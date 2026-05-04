<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Services;

use Common\Services\Service;
use Modules\Tracking\Signals\Models\TrackingSignal;

/**
 * SignalService
 *
 * Records domain event signals to persistent storage.
 *
 * @package Modules\Tracking\Signals\Services
 */
class SignalService extends Service
{
	/**
	 * Record a signal for a user.
	 *
	 * @param int|null $userId
	 * @param string $type
	 * @param array<string, mixed>|null $metadata
	 * @return void
	 */
	public function record(?int $userId, string $type, ?array $metadata = null): void
	{
		$signal = new TrackingSignal((object)[
			'userId' => $userId,
			'type' => $type,
			'metadata' => $metadata,
			'occurredAt' => date('Y-m-d H:i:s'),
		]);
		$signal->add();

		if ($userId !== null)
		{
			modules()->user()->achievement()->check($userId, $type);
		}
	}

	/**
	 * Get signals for a user, optionally filtered by type.
	 *
	 * @param int $userId
	 * @param string|null $type
	 * @param int $limit
	 * @return array<object>
	 */
	public function getForUser(int $userId, ?string $type = null, int $limit = 50): array
	{
		$filter = [['userId', $userId]];
		if ($type)
		{
			$filter[] = ['type', $type];
		}

		return TrackingSignal::fetchWhere($filter);
	}

	/**
	 * Count signals by type for a user.
	 *
	 * @param int $userId
	 * @param string $type
	 * @return int
	 */
	public function countByType(int $userId, string $type): int
	{
		$results = TrackingSignal::fetchWhere([
			['userId', $userId],
			['type', $type],
		]);

		return count($results);
	}

	/**
	 * Check if a signal of the given type already exists for the user.
	 *
	 * @param int $userId
	 * @param string $type
	 * @return bool
	 */
	public function hasSignal(int $userId, string $type): bool
	{
		$signal = TrackingSignal::getBy([
			['userId', $userId],
			['type', $type],
		]);

		return $signal !== null;
	}
}

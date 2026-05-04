<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Services;

use Common\Services\Service;
use Modules\Tracking\MediaShare\Models\MediaShare;
use Modules\Tracking\Signals\Services\SignalService;
use Modules\Tracking\Signals\Signals\SignalType;

/**
 * MediaShareService
 *
 * Handles media share tracking logic.
 *
 * @package Modules\Tracking\MediaShare\Services
 */
class MediaShareService extends Service
{
	/**
	 * Record a media share for a user.
	 *
	 * @param int $userId
	 * @param int $mediaId
	 * @param string $mediaType
	 * @param string $shareType
	 * @return object|false
	 */
	public function share(int $userId, int $mediaId, string $mediaType, string $shareType = 'external'): object|false
	{
		$existing = MediaShare::getBy([
			'userId' => $userId,
			'mediaId' => $mediaId,
			'mediaType' => $mediaType
		]);
		if ($existing)
		{
			return $existing;
		}

		$share = new MediaShare((object)[
			'userId' => $userId,
			'mediaId' => $mediaId,
			'mediaType' => $mediaType,
			'shareType' => $shareType,
		]);
		if (!$share->add())
		{
			return false;
		}

		$this->recordSignal($userId, $mediaId, $mediaType, $shareType);

		return MediaShare::getBy(['id' => $share->id]);
	}

	/**
	 * Record a tracking signal for the share.
	 *
	 * @param int $userId
	 * @param int $mediaId
	 * @param string $mediaType
	 * @param string $shareType
	 * @return void
	 */
	protected function recordSignal(int $userId, int $mediaId, string $mediaType, string $shareType): void
	{
		$signalService = new SignalService();
		$signalService->record($userId, SignalType::MEDIA_SHARED, [
			'mediaId' => $mediaId,
			'mediaType' => $mediaType,
			'shareType' => $shareType,
		]);
	}
}

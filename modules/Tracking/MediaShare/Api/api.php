<?php declare(strict_types=1);

use Modules\Tracking\MediaShare\Controllers\MediaShareController;

router()->post('tracking/media-share', [MediaShareController::class, 'share']);

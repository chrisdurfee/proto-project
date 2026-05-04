<?php declare(strict_types=1);

use Modules\Assistant\Personalization\Controllers\PersonalizationController;

router()->get('assistant/personalization/nudges', [PersonalizationController::class, 'nudges']);

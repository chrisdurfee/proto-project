<?php declare(strict_types=1);
namespace Modules\Tracking\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Activity\Models\Activity;

/**
 * ActivityController
 *
 * @package Modules\Tracking\Controllers
 */
class ActivityController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = Activity::class)
	{
		parent::__construct();
	}
}
<?php declare(strict_types=1);

namespace Modules\Auth\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Auth\Models\LoginLog;
use Proto\Http\Router\Request;
use Common\Auth\Policies\UserPolicy;

/**
 * LoginLogController
 *
 * @package Modules\Auth\Controllers
 */
class LoginLogController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = UserPolicy::class;

	/**
	 * Route parameters to auto-inject on add and auto-filter on all().
	 *
	 * @var array
	 */
	protected array $routeParams = ['userId' => true];

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = LoginLog::class)
	{
		parent::__construct();
	}

}
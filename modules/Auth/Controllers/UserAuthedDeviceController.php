<?php declare(strict_types=1);

namespace Modules\Auth\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Auth\Models\Multifactor\UserAuthedDevice;
use Proto\Http\Router\Request;
use Common\Auth\Policies\UserPolicy;

/**
 * UserAuthedDeviceController
 *
 * @package Modules\Auth\Controllers
 */
class UserAuthedDeviceController extends Controller
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
	public function __construct(protected ?string $model = UserAuthedDevice::class)
	{
		parent::__construct();
	}

	/**
	 * Revokes all authenticated devices for a user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function revokeAll(Request $request): object
	{
		$userId = (int)($request->params()->userId ?? 0);
		if (!$userId)
		{
			return $this->error('User ID required.');
		}

		$result = UserAuthedDevice::builder()
			->delete()
			->where('user_id = ?')
			->execute([$userId]);

		if (!$result)
		{
			return $this->error('Failed to revoke devices.');
		}

		return $this->response(true);
	}
}
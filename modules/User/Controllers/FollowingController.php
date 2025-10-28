<?php declare(strict_types=1);
namespace Modules\User\Controllers;

use Modules\User\Auth\Policies\FollowerPolicy;
use Proto\Controllers\ApiController as Controller;
use Proto\Http\Router\Request;
use Modules\User\Models\User;

/**
 * FollowingController
 *
 * @package Modules\User\Controllers
 */
class FollowingController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = FollowerPolicy::class;

	/**
	 * Retrieve all records.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function all(Request $request): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$user = User::get($userId);
		if ($user === null)
		{
			return $this->error('User not found.');
		}

		$inputs = $this->getAllInputs($request);
		$result = $user->following()->all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
		return $this->response($result);
	}
}
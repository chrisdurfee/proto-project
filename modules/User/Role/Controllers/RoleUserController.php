<?php declare(strict_types=1);
namespace Modules\User\Role\Controllers;

use Modules\User\Role\Auth\Policies\RoleUserPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\User\Role\Models\RoleUser;
use Proto\Http\Router\Request;

/**
 * RoleUserController
 *
 * This controller handles role-user management.
 *
 * @package Modules\User\Controllers
 */
class RoleUserController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = RoleUserPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = RoleUser::class)
	{
		parent::__construct();
	}

	/**
	 * Deletes model data.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function delete(Request $request): object
	{
		$data = $this->getRequestItem($request);
		if (empty($data) || !isset($data->userId) || !isset($data->roleId))
		{
			return $this->error('No item provided.');
		}

		return $this->response(
			$this->model()->deleteUserRole($data->userId, $data->roleId)
		);
	}
}
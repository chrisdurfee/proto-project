<?php declare(strict_types=1);
namespace Modules\User\Controllers;

use Modules\User\Auth\Policies\BlockUserPolicy;
use Proto\Controllers\ApiController as Controller;
use Modules\User\Services\User\BlockUserService;
use Proto\Http\Router\Request;
use Modules\User\Models\User;

/**
 * BlockUserController
 *
 * @package Modules\User\Controllers
 */
class BlockUserController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = BlockUserPolicy::class;

	/**
	 * BlockUserController constructor.
	 *
	 * @param BlockUserService $blockUserService
	 * @return void
	 */
	public function __construct(
		protected BlockUserService $blockUserService = new BlockUserService()
	)
	{
	}

	/**
	 * Toggles the block status.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function toggle(Request $request): object
	{
		$blockUserId = $request->params()->blockUserId ?? null;
		if (!isset($blockUserId))
		{
			return $this->error('Blocked user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID to block.');
		}

		$result = $this->blockUserService->toggleBlock((int)$userId, (int)$blockUserId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Adds a blocked user.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function block(Request $request): object
	{
		$blockUserId = $request->params()->blockUserId ?? null;
		if (!isset($blockUserId))
		{
			return $this->error('Blocked user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$result = $this->blockUserService->blockUser((int)$userId, (int)$blockUserId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

	/**
	 * Removes a blocked user.
	 *
	 * @param Request $request The request object.
	 * @return object
	 */
	public function unblock(Request $request): object
	{
		$blockUserId = $request->params()->blockUserId ?? null;
		if (!isset($blockUserId))
		{
			return $this->error('Blocked user ID is required.');
		}

		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$result = $this->blockUserService->unblockUser((int)$userId, (int)$blockUserId);
		if (!$result->success)
		{
			return $this->error($result->message);
		}

		return $this->response($result->result);
	}

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
		$result = $user->blocked()->all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
		return $this->response($result);
	}
}
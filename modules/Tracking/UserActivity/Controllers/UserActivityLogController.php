<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Controllers;

use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Tracking\UserActivity\Models\UserActivityLog;
use Modules\Tracking\UserActivity\Auth\Policies\UserActivityLogPolicy;
use Modules\User\Main\Models\User;

/**
 * UserActivityLogController
 *
 * Exposes the authenticated user's recent activity feed.
 *
 * @package Modules\Tracking\UserActivity\Controllers
 */
class UserActivityLogController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = UserActivityLogPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model
	 */
	public function __construct(protected ?string $model = UserActivityLog::class)
	{
		parent::__construct();
	}

	/**
	 * Return the most recent activity entries for the authenticated user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function all(Request $request): object
	{
		$inputs = $this->getAllInputs($request);
		$inputs->limit = min($inputs->limit ?: 20, 50);

		if (empty($inputs->modifiers['orderBy']))
		{
			$inputs->modifiers['orderBy'] = 'ual.created_at DESC';
		}

		$userId = session()->user->id;
		$filter = array_merge(
			(array)($inputs->filter ?? []),
			[['userId', $userId]]
		);

		$result = $this->model::all($filter, $inputs->offset, $inputs->limit, $inputs->modifiers);

		if ((int)$inputs->offset === 0 && empty($result->rows))
		{
			$fallback = $this->buildFallbackRow((int)$userId);
			if ($fallback !== null)
			{
				$result->rows = [$fallback];
			}
		}

		return $this->response($result);
	}

	/**
	 * Build a synthetic "Joined Rally" row for users with no logged activity yet.
	 *
	 * @param int $userId
	 * @return object|null
	 */
	protected function buildFallbackRow(int $userId): ?object
	{
		$user = User::getWithoutJoins($userId);
		if (!$user)
		{
			return null;
		}

		return (object)[
			'id' => 0,
			'userId' => $userId,
			'action' => 'account_created',
			'title' => 'Joined Rally',
			'description' => 'Welcome to the community',
			'refId' => $userId,
			'refType' => 'user',
			'createdAt' => $user->createdAt ?? date('Y-m-d H:i:s'),
		];
	}
}

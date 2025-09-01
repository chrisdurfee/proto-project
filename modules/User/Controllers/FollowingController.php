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
	 * @param array|object|null $filter Filter criteria.
	 * @param int|null $offset Offset.
	 * @param int|null $limit Count.
	 * @param array|null $modifiers Modifiers.
	 * @return object
	 */
	public function all(Request $request): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$filter = $this->getFilter($request);
		$offset = $request->getInt('offset') ?? 0;
		$limit = $request->getInt('limit') ?? 50;
		$search = $request->input('search');
		$custom = $request->input('custom');
		$lastCursor = $request->input('lastCursor') ?? null;
		$dates = $this->setDateModifier($request);
		$orderBy = $this->setOrderByModifier($request);
		$groupBy = $this->setGroupByModifier($request);

		$user = User::get($userId);
		$result = $user->following()->all($filter, $offset, $limit, [
			'search' => $search,
			'custom' => $custom,
			'dates' => $dates,
			'orderBy' => $orderBy,
			'groupBy' => $groupBy,
			'cursor' => $lastCursor
		]);
		return $this->response($result);
	}
}
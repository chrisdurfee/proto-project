<?php declare(strict_types=1);
namespace Modules\User\Search\Controllers;

use Modules\User\Search\Auth\Policies\UserSearchPolicy;
use Modules\User\Search\Models\UserSearch;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * UserSearchController
 *
 * A safe, read-only controller for searching users.
 * Returns only public profile fields — no sensitive data.
 *
 * @package Modules\User\Search\Controllers
 */
class UserSearchController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = UserSearchPolicy::class;

	/**
	 * @param string|null $model
	 */
	public function __construct(protected ?string $model = UserSearch::class)
	{
		parent::__construct();
	}

	/**
	 * Modify the filter to only include enabled, non-deleted users
	 * and exclude the current session user from results.
	 *
	 * @param object|null $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		if ($filter === null)
		{
			$filter = new \stdClass();
		}

		$filter->enabled = 1;

		$userId = session()->user->id;
		$filter->{'u.id'} = ['!=', $userId];

		return $filter;
	}
}

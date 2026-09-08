<?php declare(strict_types=1);
namespace Modules\Developer\Auth\Policies;

use Common\Auth\Policies\Policy;
use Modules\Developer\Auth\Gates\EnvGate;
use Proto\Controllers\ControllerInterface;
use Proto\Http\Router\Request;

/**
 * OperationsPolicy
 *
 * Governs CRM Platform operations tooling that is shared with the
 * developer app: migrations, error log, slow query log, email
 * preview/test, server health, and cron telemetry.
 *
 * Access rules:
 * - Unauthenticated callers are always denied
 * - Authenticated admins may access these endpoints in any environment
 * - Cron telemetry (`jobs` / `runs`) also allows `crm.access` so CRM
 *   staff can open Platform → Crons without a full admin role
 * - On local developer machines (env=dev), authenticated users with
 *   the `developer.access` permission may also access them
 *
 * Dangerous local-only tooling (generator, SMS/push test harnesses)
 * remains on DeveloperPolicy and is not covered here.
 *
 * @package Modules\Developer\Auth\Policies
 */
class OperationsPolicy extends Policy
{
	/**
	 * @var string|null $type
	 */
	protected ?string $type = 'developerOperations';

	/**
	 * @param ControllerInterface|null $controller
	 * @param EnvGate $gate
	 * @return void
	 */
	public function __construct(
		protected ?ControllerInterface $controller = null,
		protected EnvGate $gate = new EnvGate()
	)
	{
		parent::__construct($controller);
	}

	/**
	 * Default access check for operations endpoints.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function default(Request $request): bool
	{
		if (!$this->isSignedIn())
		{
			return false;
		}

		if ($this->isAdmin())
		{
			return true;
		}

		return $this->gate->isDev() && $this->canAccess('developer.access');
	}

	/**
	 * List registered cron jobs (CRM staff with crm.access).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function jobs(Request $request): bool
	{
		if (!$this->isSignedIn())
		{
			return false;
		}

		if ($this->canAccess('crm.access'))
		{
			return true;
		}

		return $this->gate->isDev() && $this->canAccess('developer.access');
	}

	/**
	 * List cron run history (CRM staff with crm.access).
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function runs(Request $request): bool
	{
		return $this->jobs($request);
	}
}

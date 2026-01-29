<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * ClientResourcePolicy
 *
 * @package Modules\Client\Conversation\Auth\Policies
 */
class ClientResourcePolicy extends Policy
{
    /**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'client.resource';

	/**
	 * Checks if the user can access the CRM.
	 *
	 * @return bool True if the user can access the CRM, otherwise false.
	 */
	protected function canAccessCrm(): bool
	{
		return $this->hasPermission('crm.access');
	}

    /**
	 * Default policy for methods that don't have an explicit policy method.
	 *
	 * @param Request $request
	 * @return bool True if the user can view users, otherwise false.
	 */
	public function default(Request $request): bool
	{
		if (!$this->canAccessCrm())
		{
			return false;
		}

		return parent::default($request);
	}

	/**
	 * Checks if the user can peform action on the resource.
	 *
	 * @suppresswarnings PHP0418
	 * @param Request $request
	 * @param string $keyName
	 * @return bool
	 */
	protected function allowResourceAction(Request $request, string $keyName = 'createdBy'): bool
	{
		/**
		 * We will check if they have the permission to perform
		 * the action or if they own the resource.
		 */
		if ($this->checkTypeByMethod($request))
		{
			return true;
		}

		$resourceId = $this->getResourceId($request);
		if (!isset($resourceId))
		{
			return false;
		}

		$item = $this->controller->get($resourceId);
		if (!$item)
		{
			return false;
		}

		$userId = $item->{$keyName} ?? null;
		if (!isset($userId))
		{
			return false;
		}

		return $this->ownsResource($userId);
	}

	/**
	 * Determines if the user can update an existing user.
	 *
	 * @suppresswarnings PHP0418
	 * @param Request $request The request object.
	 * @return bool True if the user can edit resources, otherwise false.
	 */
	public function update(Request $request): bool
	{
		return $this->allowResourceAction($request);
	}

	/**
	 * Determines if the user can delete an existing user.
	 *
	 * @suppresswarnings PHP0418
	 * @param Request $request The request object.
	 * @return bool True if the user can delete resources, otherwise false.
	 */
	public function delete(Request $request): bool
	{
		return $this->allowResourceAction($request);
	}
}

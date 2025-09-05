<?php declare(strict_types=1);
namespace Modules\User\Auth\Policies;

use Modules\User\Auth\Gates\OrganizationGate;
use Proto\Http\Router\Request;
use Proto\Controllers\Controller;

/**
 * OrganizationPolicy
 *
 * Governs access to organization resources.
 *
 * @package Modules\User\Auth\Policies
 */
class OrganizationPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'organization';

	/**
	 * This will set up the organization-based access control gate.
	 *
	 * @param ?Controller $controller
	 * @param OrganizationGate $organizationGate
	 */
	public function __construct(
		?Controller $controller = null,
		protected OrganizationGate $organizationGate = new OrganizationGate()
	)
	{
		parent::__construct($controller);
	}

	/**
	 * Check if the current user can access a specific organization.
	 *
	 * @param mixed $orgId The organization ID to check against.
	 * @return bool True if the current user has access to the organization, otherwise false.
	 */
	public function canAccessOrganization(mixed $orgId): bool
	{
		if ($this->isAdmin())
		{
			return true;
		}

		return $this->organizationGate->canAccess($orgId);
	}

	/**
	 * Determine if the user can view a single organization.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return false;
		}

		return $this->can($id, 'organization.view');
	}

	/**
	 * Shared logic for editing an organization.
	 *
	 * @param mixed $orgId
	 * @param string $permission
	 * @return bool
	 */
	protected function can(mixed $orgId, string $permission): bool
	{
		if (!$this->canAccess($permission))
		{
			return false;
		}

		return $this->canAccessOrganization($orgId);
	}

	/**
	 * Determine if the user can update an existing organization.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return false;
		}

		return $this->can($id, 'organization.edit');
	}

	/**
	 * Determine if the user can delete an organization.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return false;
		}

		return $this->can($id, 'organization.delete');
	}
}
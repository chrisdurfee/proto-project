<?php declare(strict_types=1);

namespace Modules\Assistant\Personalization\Controllers;

use Proto\Controllers\ApiController;
use Proto\Http\Router\Request;
use Modules\Assistant\Personalization\Auth\Policies\PersonalizationPolicy;
use Modules\Assistant\Personalization\Services\PersonalizationService;

/**
 * PersonalizationController
 *
 * Handles assistant personalisation endpoints.
 *
 * @package Modules\Assistant\Personalization\Controllers
 */
class PersonalizationController extends ApiController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = PersonalizationPolicy::class;

	/**
	 * @var PersonalizationService $service
	 */
	private PersonalizationService $service;

	/**
	 * @return void
	 */
	public function __construct()
	{
		$this->service = new PersonalizationService();
		parent::__construct();
	}

	/**
	 * Return contextual nudges for the authenticated user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function nudges(Request $request): object
	{
		$userId = (int)session()->user->id;
		$nudges = $this->service->getNudges($userId);
		return $this->response($nudges);
	}
}

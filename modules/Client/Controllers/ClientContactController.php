<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientContactPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\ClientContact;
use Proto\Http\Router\Request;

/**
 * ClientContactController
 *
 * @package Modules\Client\Controllers
 */
class ClientContactController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientContactPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = ClientContact::class)
	{
		parent::__construct();
	}

	/**
	 * Modifies the filter object based on the request.
	 *
	 * @param mixed $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		$clientId = $request->params()->clientId ?? null;
		if (isset($clientId))
		{
			$filter->clientId = $clientId;
		}

		return $filter;
	}
}
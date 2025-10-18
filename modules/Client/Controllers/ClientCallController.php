<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientResourcePolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\ClientCall;
use Proto\Http\Router\Request;

/**
 * ClientCallController
 *
 * @package Modules\Client\Controllers
 */
class ClientCallController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = ClientCall::class)
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

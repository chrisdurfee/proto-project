<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientResourcePolicy;
use Modules\Client\Models\ClientNote;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * ClientNoteController
 *
 * @package Modules\Client\Controllers
 */
class ClientNoteController extends ResourceController
{
    /**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * ClientNoteController constructor.
	 */
	public function __construct(
		protected ?string $model = ClientNote::class
	)
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

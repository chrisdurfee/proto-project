<?php declare(strict_types=1);
namespace Modules\Client\Contact\Controllers;

use Modules\Client\Contact\Auth\Policies\ClientContactPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Contact\Models\ClientContact;
use Modules\Client\Contact\Services\ClientContactService;
use Proto\Http\Router\Request;

/**
 * ClientContactController
 *
 * @package Modules\Client\Contact\Controllers
 */
class ClientContactController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientContactPolicy::class;

	/**
	 * @var string|null $serviceClass
	 */
	protected ?string $serviceClass = ClientContactService::class;

	/**
	 * Route parameters to auto-inject on add and auto-filter on all().
	 *
	 * @var array
	 */
	protected array $routeParams = ['clientId' => true];

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = ClientContact::class
	)
	{
		parent::__construct();
	}

	/**
	 * Modifies the data before adding.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifyAddItem(object &$data, Request $request): void
	{
		parent::modifyAddItem($data, $request);

		// Restrict fields that shouldn't be directly set
		$restrictedFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
		$this->restrictFields($data, $restrictedFields);
	}
}

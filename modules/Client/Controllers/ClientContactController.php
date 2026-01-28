<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientContactPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\ClientContact;
use Modules\Client\Services\ClientContactService;
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
	public function __construct(
		protected ?string $model = ClientContact::class,
		protected ?ClientContactService $service = new ClientContactService()
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

	/**
	 * Modifies the data before adding.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifyAddItem(object &$data, Request $request): void
	{
		// Restrict fields that shouldn't be directly set
		$restrictedFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
		$this->restrictFields($data, $restrictedFields);

		$clientId = $request->params()->clientId ?? null;
		if (isset($clientId))
		{
			$data->clientId = $clientId;
		}
	}

	/**
	 * Modifies the data before updating.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifyUpdateItem(object &$data, Request $request): void
	{
		// Store the ID before restricting it
		$id = $data->id ?? null;

		// Restrict fields that shouldn't be directly updated
		$restrictedFields = ['id', 'clientId', 'createdAt', 'createdBy', 'deletedAt'];
		$this->restrictFields($data, $restrictedFields);

		// restore id
		$data->id = $id;
	}

	/**
	 * Override addItem to handle user account creation/linking.
	 *
	 * @param object $data
	 * @return object
	 */
	protected function addItem(object $data): object
	{
		$result = $this->service->add($data);
		if (!$result->success)
		{
			return $this->error($result->error ?? 'Failed to create contact');
		}

		return $this->response(['id' => $result->contact->id]);
	}

	/**
	 * Override updateItem to handle user account creation/linking.
	 *
	 * @param object $data
	 * @return object
	 */
	protected function updateItem(object $data): object
	{
		$contactId = (int)$data->id;
		$result = $this->service->update($data, $contactId);
		if (!$result->success)
		{
			return $this->error($result->error ?? 'Failed to update contact');
		}

		return $this->response(['id' => $result->contact->id]);
	}
}
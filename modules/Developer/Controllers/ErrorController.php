<?php declare(strict_types=1);
namespace Modules\Developer\Controllers;

use Proto\Error\Models\ErrorLog;
use Proto\Http\Router\Request;

/**
 * ErrorController
 *
 * This will be the controller for the error.
 *
 * @package Modules\Developer\Controllers
 */
class ErrorController extends Controller
{
	/**
	 * This will toggle the resolved status of an error.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function toggleResolve(Request $request): object
	{
		$id = $request->getInt('id');
		$resolved = $request->input('resolved');
		if (!isset($id) || !isset($resolved))
		{
			return $this->error('Invalid request.');
		}

		return $this->updateResolved($id, $resolved);
	}

	/**
	 * This will update model item resolved status.
	 *
	 * @param int $id
	 * @param string|int $resolved
	 * @return object
	 */
	public function updateResolved(int $id, string|int $resolved): object
	{
		$model = new ErrorLog((object)[
			'id' => $id,
			'resolved' => $resolved
		]);
		$result = $model->updateResolved();
		return $this->response($result);
	}

	/**
	 * This will get the filter from the request.
	 *
	 * @param Request $request The request object.
	 * @return mixed The filter criteria.
	 */
	public function getFilter(Request $request): mixed
	{
		$filter = $request->input('filter') ?? $request->input('option');
		$filter = strtolower($filter ?? '');
		if (empty($filter) || $filter === 'all')
		{
			return [];
		}

		return [
			['env', $filter]
		];
	}

    /**
	 * This will get rows from a model.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function all(
        Request $request
    ): object
	{
		$inputs = $this->getAllInputs($request);
		$result = ErrorLog::all($inputs->filter, $inputs->offset, $inputs->limit, $inputs->modifiers);
		return $this->response($result);
	}
}
<?php declare(strict_types=1);
namespace Modules\Tracking\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Tracking\Models\Activity;
use Proto\Http\Router\Request;

/**
 * ActivityController
 *
 * @package Modules\Tracking\Controllers
 */
class ActivityController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = Activity::class)
	{
		parent::__construct();
	}

	/**
	 * This will return the validation rules for the model.
	 *
	 * @return array<string, string>
	 */
	protected function validate(): array
	{
		return [
			'userId' => 'int:30|required',
			'refId' => 'int:30|required'
		];
	}

	/**
	 * Gets model data by type.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function getByType(Request $request): object
	{
		$type = $request->input('type');
        $refId = $request->getInt('refId');
		if (empty($type) || empty($refId))
		{
			return $this->error('No item provided.');
		}

		return $this->response(
			[
				'rows' => $this->model()->getByType($type, $refId)
			]
		);
	}

	/**
	 * Deletes model data.
	 *
	 * @param Request $request The request object.
	 * @return object The response.
	 */
	public function deleteUserByType(Request $request): object
	{
		$type = $request->input('type');
        $refId = $request->getInt('refId');
        $userId = $request->getInt('userId');
		if (empty($type) || empty($refId) || empty($userId))
		{
			return $this->error('No item provided.');
		}

		return $this->response(
			$this->model()->deleteUserByType($type, $refId, $userId)
		);
	}
}
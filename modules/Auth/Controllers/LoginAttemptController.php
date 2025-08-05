<?php declare(strict_types=1);
namespace Modules\Auth\Controllers;

use Proto\Controllers\ModelController as Controller;
use Modules\Auth\Models\LoginAttempt;
use Modules\Auth\Models\LoginAttemptUsername;

/**
 * LoginAttemptController
 *
 * @package Modules\Auth\Controllers
 */
class LoginAttemptController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = LoginAttempt::class)
	{
		parent::__construct();
	}

	/**
	 * This will add the username.
	 *
	 * @param string $username
	 * @return int
	 */
	protected function addUsername(string $username): ?int
	{
		$model = new LoginAttemptUsername((object)[
			'username' => $username
		]);

		$model->setup();
		return $model->id ?? null;
	}

	/**
	 * This will add model data.
	 *
	 * @param object $data
	 * @return object
	 */
	public function add(object $data): object
	{
		/**
		 * This will add the username to the login attempts before
		 * adding the attempt.
		 */
		$usernameId = $this->addUsername($data->username);

		// this will set the username id to the login attempt
		$data->usernameId = $usernameId;
		return parent::add($data);
	}
}
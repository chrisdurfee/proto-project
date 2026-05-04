<?php declare(strict_types=1);
namespace Modules\User\Main\Controllers;

use Modules\Garage\Vehicle\Models\GarageVehicle;
use Modules\User\Blocked\Models\BlockUser;
use Modules\User\Follower\Models\FollowerUser;
use Modules\User\Main\Auth\Gates\EmailVerificationGate;
use Modules\User\Main\Controllers\Helpers\UserHelper;
use Modules\User\Main\Models\User;
use Modules\User\Main\Auth\Policies\UserPolicy;
use Modules\User\Main\Services\PasswordUpdateService;
use Modules\User\Main\Services\UnsubscribeService;
use Modules\User\Main\Services\UserImageService;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/*
 * UserController
 *
 * This is the controller class for the model "User".
 *
 * @package Modules\User\Controllers
 */
class UserController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = UserPolicy::class;

	/**
	 * This will setup the model class.
	 *
	 * @param string|null $model by using the magic constant ::class
	 */
	public function __construct(
		protected ?string $model = User::class
	)
	{
		parent::__construct();
	}

	/**
	 * Gets a user profile by ID and appends an isFollowing flag for the
	 * currently authenticated session user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function get(Request $request): object
	{
		$id = $this->getResourceId($request);
		if ($id === null)
		{
			return $this->error('The ID is required to get the item.');
		}

		$user = User::get($id);
		if (!$user)
		{
			return $this->response(['row' => null]);
		}

		$userData = $user->getData();
		$sessionUserId = session()->user->id;
		$userData->isFollowing = FollowerUser::isAdded((int)$id, (int)$sessionUserId);
		$userData->isBlocked = BlockUser::isAdded((int)$sessionUserId, (int)$id);

		return $this->response(['row' => $userData]);
	}

	/**
	 * This will return the validation rules for the model.
	 *
	 * @return array<string, string>
	 */
	protected function validate(): array
	{
		return [
			'firstName' => 'string:255|required',
			'lastName' => 'string:255|required',
			'email' => 'email:255|required',
			'displayName' => 'string:150',
			'image' => 'string:150',
			'coverImageUrl' => 'string:255',
			'bio' => 'string:2000',
			'dob' => 'string:10',
			'gender' => 'string:20',
			'street1' => 'string:255',
			'street2' => 'string:255',
			'city' => 'string:255',
			'state' => 'string:100',
			'postalCode' => 'string:20',
			'country' => 'string:100',
			'mobile' => 'phone:14',
			'timezone' => 'string:50',
			'language' => 'string:10',
			'currency' => 'string:3'
		];
	}

	/**
	 * Updates a model item.
	 *
	 * This method initializes the model with the provided data and adds user data for updates.
	 *
	 * @param object $data The data to set up the model with.
	 * @return object The response object.
	 */
	protected function addItem(object $data): object
	{
		/**
		 * Check if the username is taken.
		 */
		if (User::isUsernameTaken($data->username ?? ''))
		{
			return $this->error('Username is already taken.');
		}

		UserHelper::restrictData($data);
		return parent::addItem($data);
	}

	/**
	 * Updates a model item.
	 *
	 * This method initializes the model with the provided data and adds user data for updates.
	 *
	 * @param object $data The data to set up the model with.
	 * @return object The response object.
	 */
	protected function updateItem(
		object $data
	): object
	{
		if (!auth()->permission->hasPermission('user.edit'))
		{
			/**
			 * Restrict admin controls.
			 */
			unset($data->enabled);
			unset($data->verified);
		}

		/**
		 * Check if the email is already taken by another user.
		 */
		$email = $data->email ?? null;
		if ($email)
		{
			$existing = User::getBy(['email' => $email]);
			if ($existing && (int)$existing->id !== (int)$data->id)
			{
				$this->setError('Email is already taken.');
				return (object)[];
			}
		}

		/**
		 * Restrict the username, password, and other sensitive fields from being updated. This
		 * should be done elsewhere to prevent unauthorized changes.
		 */
		UserHelper::restrictCredentials($data);
		UserHelper::restrictData($data);

		/**
		 * This will update the user's notification preferences.
		 */
		$this->updateNotifications($data);

		/**
		 * This will update the user's privacy settings.
		 */
		$this->updatePrivacy($data);

		$response = parent::updateItem($data);

		if (!empty($response->success))
		{
			modules()->tracking()->userActivityLog()->log(
				(int)$data->id,
				'profile_updated',
				'Updated your profile',
				null,
				(int)$data->id,
				'user'
			);
		}

		return $response;
	}

	/**
	 * Check whether the user is being granted the verified badge in this update.
	 *
	 * Returns true only when the incoming data sets verified = 1 and the user
	 * does not already have the verified badge.
	 *
	 * @param object $data
	 * @return bool
	 */
	protected function isBeingVerified(object $data): bool
	{
		if (empty($data->verified) || (int)$data->verified !== 1)
		{
			return false;
		}

		$user = User::getWithoutJoins((int)$data->id);
		return $user !== null && (int)$user->verified !== 1;
	}

	/**
	 * Updates the user's notification preferences via a dedicated endpoint.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function updateNotificationSettings(Request $request): object
	{
		$id = $this->getResourceId($request);
		if (!$id)
		{
			return $this->error('User ID is required.');
		}

		$data = $this->getRequestItem($request);
		if (empty($data))
		{
			return $this->error('No data provided.');
		}

		$this->validateRules((array)$data, [
			'allowEmail' => 'int',
			'allowSms' => 'int',
			'allowPush' => 'int',
			'marketingOptIn' => 'int'
		]);

		$settings = (object)[
			'userId' => (int)$id,
			'allowEmail' => $data->allowEmail ?? null,
			'allowSms' => $data->allowSms ?? null,
			'allowPush' => $data->allowPush ?? null
		];
		$service = new UnsubscribeService();
		$service->updateNotificationPreferences($settings);

		if (isset($data->marketingOptIn))
		{
			$user = User::get($id);
			if ($user)
			{
				$user->marketingOptIn = (int)$data->marketingOptIn;
				$user->update();
			}
		}

		return $this->success();
	}

	/**
	 * Updates the user's notification preferences from the full update flow.
	 *
	 * @param object $data
	 * @return bool
	 */
	protected function updateNotifications(object $data): bool
	{
		$settings = (object)[
			'userId' => $data->id,
			'allowEmail' => $data->allowEmail,
			'allowSms' => $data->allowSms,
			'allowPush' => $data->allowPush
		];
		$service = new UnsubscribeService();
		return $service->updateNotificationPreferences($settings);
	}

	/**
	 * This will verify the email address.
	 *
	 * @param Request $request
	 * @param EmailVerificationGate $gate
	 * @return object
	 */
	public function verifyEmail(
		Request $request,
		EmailVerificationGate $gate = new EmailVerificationGate()
	): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		if (!$gate->isValid($request->input('token'), $userId))
		{
			return $this->error('Invalid request.');
		}

		/**
		 * This will add the email verified date to the user.
		 */
		$response = parent::update((object)[
			'id' => $userId,
			'emailVerifiedAt' => date('Y-m-d H:i:s')
		]);

		if ($response->success)
		{
			/**
			 * This will update the request status.
			 */
			$gate->updateRequest();
		}

		return $response;
	}

	/**
	 * This will mark that the user has accepted the terms.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function acceptTerms(Request $request): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		/**
		 * This will add the accepted terms date to the user.
		 */
		$response = parent::update((object)[
			'id' => $userId,
			'acceptedTermsAt' => date('Y-m-d H:i:s')
		]);

		return $response;
	}

	/**
	 * This will update the user's marketing preference.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function allowMarketing(Request $request): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$marketingOptIn = $request->getInt('marketingOptIn');
		if ($marketingOptIn === null)
		{
			return $this->error('Marketing preference is required.');
		}

		/**
		 * This will update the user's marketing preference.
		 */
		$response = parent::update((object)[
			'id' => $userId,
			'marketingOptIn' => $marketingOptIn
		]);

		return $response;
	}

	/**
	 * This will unsubscribe the user.
	 *
	 * @param Request $request
	 * @param UnsubscribeService $service
	 * @return object
	 */
	public function unsubscribe(
		Request $request,
		UnsubscribeService $service = new UnsubscribeService()
	): object
	{
		$data = (object)[
			'email' => $request->input('email'),
			'requestId' => $request->input('requestId')
		];

		if (!$data->email || !$data->requestId)
		{
			return $this->error('Invalid unsubscribe request.');
		}

		$allowEmail = $request->getInt('allowEmail') ?? 0;
		if (isset($allowEmail))
		{
			$data->allowEmail = $allowEmail;
		}

		$allowSms = $request->getInt('allowSms');
		if (isset($allowSms))
		{
			$data->allowSms = $allowSms;
		}

		$allowPush = $request->getInt('allowPush');
		if (isset($allowPush))
		{
			$data->allowPush = $allowPush;
		}

		$result = $service->unsubscribe($data);
		return (!$result)? $this->error('Failed to unsubscribe user.') : $this->response([
			'message' => 'User unsubscribed successfully.'
		]);
	}

	/**
	 * Updates the user credentials.
	 *
	 * @param Request $request The request object.
	 * @param PasswordUpdateService $service The service to handle password updates.
	 * @return object The response.
	 */
	public function updateCredentials(
		Request $request,
		PasswordUpdateService $service = new PasswordUpdateService()
	): object
	{
		$userId = $this->getResourceId($request);
		if (!isset($userId))
		{
			return $this->error('Invalid user ID.');
		}

		$username = $request->input('username');
		if ($username === "undefined")
		{
			$username = null;
		}

		$password = $request->input('password');
		if ($password === "undefined")
		{
			$password = null;
		}

		$data = (object)[
			'id' => $userId,
			'username' => $username,
			'password' => $password
		];

		$result = $service->updateCredentials($data);
		return $this->response($result);
	}

	/**
	 * This will get the user roles.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function getRoles(
		Request $request
	): object
	{
		$userId = $request->params()->userId ?? null;
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		/**
		 * This will get the user roles.
		 */
		$model = $this->model::get($userId);
		if ($model === null)
		{
			return $this->error('User not found.');
		}

		return $this->response([
			'rows' => $model->roles
		]);
	}

	/**
	 * Uploads and sets the user's profile image.
	 *
	 * @param Request $request The request object.
	 * @param UserImageService $imageService The image service.
	 * @return object The response.
	 */
	public function uploadImage(
		Request $request,
		UserImageService $imageService = new UserImageService()
	): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		/**
		 * This will validate the uploaded files.
		 */
		$files = $request->files();
		$this->validateRules($files, [
			'image' => 'image:30000|required|mimes:jpeg,jpg,png,gif,webp,heic,heif,avif,jxl'
		]);

		/**
		 * Get the uploaded file.
		 */
		$uploadFile = $files['image'] ?? null;
		if ($uploadFile === null)
		{
			return $this->error('No image file provided.');
		}

		/**
		 * Use the service to handle the complete upload workflow.
		 */
		$result = $imageService->uploadUserImage($uploadFile, $userId);
		if ($result->success)
		{
			return $this->response($result);
		}

		return $this->error($result->message);
	}

	/**
	 * Uploads and sets the user's cover image.
	 *
	 * @param Request $request The request object.
	 * @param UserImageService $imageService The image service.
	 * @return object The response.
	 */
	public function uploadCoverImage(
		Request $request,
		UserImageService $imageService = new UserImageService()
	): object
	{
		$userId = $this->getResourceId($request);
		if ($userId === null)
		{
			return $this->error('Invalid user ID.');
		}

		$files = $request->files();
		$this->validateRules($files, [
			'image' => 'image:30000|required|mimes:jpeg,jpg,png,gif,webp,heic,heif,avif,jxl'
		]);

		$uploadFile = $files['image'] ?? null;
		if ($uploadFile === null)
		{
			return $this->error('No image file provided.');
		}

		$result = $imageService->uploadUserCoverImage($uploadFile, $userId);
		if ($result->success)
		{
			return $this->response($result);
		}

		return $this->error($result->message);
	}

	/**
	 * We want to override the status update to publish a Redis event.
	 *
	 * @param object $data The data to set up the model with.
	 * @return object The response object.
	 */
	protected function updateItemStatus(object $data): object
	{
		$response = parent::updateItemStatus($data);
		if ($response->success)
		{
			// Publish Redis event for real-time status tracking
			events()->emit("redis:user:{$data->id}:status", [
				'id' => $data->id,
				'status' => $data->status
			]);
		}
		return $response;
	}
}
<?php declare(strict_types=1);

namespace Modules\User\Gateway;

use Modules\User\Main\Models\User;
use Modules\User\Main\Services\NewUserService;
use Modules\User\Main\Gateway\SecureRequestGateway;
use Modules\User\Main\Gateway\EmailGateway;
use Modules\User\Main\Gateway\SmsGateway;
use Modules\User\Follower\Gateway\Gateway as FollowerGateway;
use Modules\User\Following\Gateway\Gateway as FollowingGateway;
use Modules\User\Blocked\Gateway\Gateway as BlockedGateway;
use Modules\User\Organization\Gateway\Gateway as OrganizationGateway;
use Modules\User\Permission\Gateway\Gateway as PermissionGateway;
use Modules\User\Role\Gateway\Gateway as RoleGateway;
use Modules\User\Push\Gateway\Gateway as PushGateway;

/**
 * User Gateway
 *
 * This will handle the user module gateway.
 *
 * @package Modules\User\Gateway
 */
class Gateway
{
	/**
	 * This will add the user.
	 *
	 * @param object $settings
	 * @return bool
	 */
	public function add(object $settings): bool
	{
		$model = new User($settings);
		return $model->add();
	}

	/**
	 * This will create the user and returns the model with id.
	 *
	 * @param object $settings
	 * @return User
	 */
	public function create(object $settings): User
	{
		$model = new User($settings);
		$model->add();
		return $model;
	}

	/**
	 * This will update the user.
	 *
	 * @param object $settings
	 * @return bool
	 */
	public function update(object $settings): bool
	{
		$model = new User($settings);
		return $model->update();
	}

	/**
	 * This will get the user by ID.
	 *
	 * @param mixed $id
	 * @return User|null
	 */
	public function get(mixed $id): ?User
	{
		return User::get($id);
	}

	/**
	 * This will get the user by credentials.
	 *
	 * @param string $username
	 * @param string $password
	 * @return int
	 */
	public function authenticate(string $username, string $password): int
	{
		return User::authenticate($username, $password);
	}

	/**
	 * This will register a new user.
	 *
	 * @param object $data
	 * @return User|null
	 */
	public function register(object $data): ?User
	{
		$service = new NewUserService();
		return $service->createUser($data);
	}

	/**
	 * This will update the new user password.
	 *
	 * @param object $data
	 * @return User|null
	 */
	public function setPassword(object $data): ?User
	{
		$service = new NewUserService();
		return $service->setPassword($data);
	}

	/**
	 * This will update the new user profile.
	 *
	 * @param object $data
	 * @return User|null
	 */
	public function updateProfile(object $data): ?User
	{
		$service = new NewUserService();
		return $service->updateProfile($data);
	}

	/**
	 * This will get the user by email.
	 *
	 * @param string $email
	 * @return User|null
	 */
	public function getByEmail(string $email): ?User
	{
		$model = new User();
		return $model->getByEmail($email);
	}

	/**
	 * This will update the user status.
	 *
	 * @param int $id
	 * @param string $status
	 * @return bool
	 */
	public function updateStatus(int $id, string $status): bool
	{
		$model = new User((object)[
			'id' => $id,
			'status' => $status
		]);
		return $model->updateStatus();
	}

	/**
	 * This will check if the username is taken.
	 *
	 * @param string $username
	 * @return bool
	 */
	public function isUsernameTaken(string $username): bool
	{
		return User::isUsernameTaken($username);
	}

	/**
	 * Access the Follower feature gateway
	 *
	 * @return FollowerGateway
	 */
	public function follower(): FollowerGateway
	{
		return new FollowerGateway();
	}

	/**
	 * Access the Following feature gateway
	 *
	 * @return FollowingGateway
	 */
	public function following(): FollowingGateway
	{
		return new FollowingGateway();
	}

	/**
	 * Access the Blocked feature gateway
	 *
	 * @return BlockedGateway
	 */
	public function blocked(): BlockedGateway
	{
		return new BlockedGateway();
	}

	/**
	 * Access the Organization feature gateway
	 *
	 * @return OrganizationGateway
	 */
	public function organization(): OrganizationGateway
	{
		return new OrganizationGateway();
	}

	/**
	 * Access the Permission feature gateway
	 *
	 * @return PermissionGateway
	 */
	public function permission(): PermissionGateway
	{
		return new PermissionGateway();
	}

	/**
	 * Access the Role feature gateway
	 *
	 * @return RoleGateway
	 */
	public function role(): RoleGateway
	{
		return new RoleGateway();
	}

	/**
	 * Access the Push feature gateway
	 *
	 * @return PushGateway
	 */
	public function push(): PushGateway
	{
		return new PushGateway();
	}

	/**
	 * Access the secure request gateway
	 *
	 * @return SecureRequestGateway
	 */
	public function secureRequest(): SecureRequestGateway
	{
		return new SecureRequestGateway();
	}

	/**
	 * Access email gateway
	 *
	 * @return EmailGateway
	 */
	public function email(): EmailGateway
	{
		return new EmailGateway();
	}

	/**
	 * Access SMS gateway
	 *
	 * @return SmsGateway
	 */
	public function sms(): SmsGateway
	{
		return new SmsGateway();
	}
}

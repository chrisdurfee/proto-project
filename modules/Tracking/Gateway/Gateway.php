<?php declare(strict_types=1);

namespace Modules\Tracking\Gateway;

use Modules\Tracking\Signals\Gateway\Gateway as SignalsGateway;
use Modules\Tracking\UserActivity\Gateway\Gateway as UserActivityGateway;

/**
 * Gateway
 *
 * Root gateway for the Tracking module.
 *
 * @package Modules\Tracking\Gateway
 */
class Gateway
{
	/**
	 * Access the signals sub-gateway.
	 *
	 * @return SignalsGateway
	 */
	public function signal(): SignalsGateway
	{
		return new SignalsGateway();
	}

	/**
	 * Access the user activity log sub-gateway.
	 *
	 * @return UserActivityGateway
	 */
	public function userActivityLog(): UserActivityGateway
	{
		return new UserActivityGateway();
	}
}

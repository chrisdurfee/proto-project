<?php declare(strict_types=1);
namespace Common
{
	use Proto\Patterns\Structural\Registry;

	/**
	 * Auth
	 *
	 * This will allow authentication to be handled.
	 *
	 * @package Common
	 */
	class Auth extends Registry
	{
		/**
		 * The singleton instance.
		 *
		 * @var self|null
		 */
		protected static ?self $instance = null;
	}
}

namespace
{
	use Common\Auth;

	/**
	 * This will get the instance of Auth.
	 *
	 * @return Auth
	 */
	function auth(): Auth
	{
		return Auth::getInstance();
	}
}

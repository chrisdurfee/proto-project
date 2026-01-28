<?php declare(strict_types=1);
namespace Modules\User\Main\Controllers\Helpers;

/*
 * UserHelper
 *
 * This is the helper class for the model "User".
 *
 * @package Modules\User\Controllers\Helpers
 */
class UserHelper
{
	/**
	 * Restricts the fields from the given data.
	 *
	 * @param object $data The data to restrict.
	 * @param array $fields The fields to restrict.
	 * @return void
	 */
	protected static function restrictFields(object &$data, array $fields = []): void
	{
		foreach ($fields as $field)
		{
			unset($data->$field);
		}
	}

	/**
	 * Restricts the data that can be updated.
	 *
	 * @param object $data The data to restrict.
	 * @return void
	 */
	public static function restrictCredentials(object &$data): void
	{
		$fields = ['username', 'password'];
		self::restrictFields($data, $fields);
	}

	/**
	 * Restricts the data that can be updated.
	 *
	 * @param object $data The data to restrict.
	 * @return void
	 */
	public static function restrictData(object &$data): void
	{
		$fields = ['emailVerifiedAt', 'acceptedTermsAt', 'trialMode', 'trialDaysLeft', 'followerCount', 'deletedAt', 'verified'];
		self::restrictFields($data, $fields);
	}
}
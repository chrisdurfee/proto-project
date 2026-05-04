<?php declare(strict_types=1);
namespace Common\Services;

use Common\Services\Traits\ResponseTrait;

/**
 * Service
 *
 * Abstract service class providing common functionalities for services.
 *
 * @package Common\Services
 */
abstract class Service
{
	use ResponseTrait;

	/**
	 * Generate a UUID v4
	 *
	 * @return string
	 */
	protected function generateUuid(): string
	{
		$data = random_bytes(16);
		$data[6] = chr(ord($data[6]) & 0x0f | 0x40);
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80);
		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
	}

	/**
	 * Restricts the fields from the given data.
	 *
	 * @param object $data The data to restrict.
	 * @param array $fields The fields to restrict.
	 * @return void
	 */
	protected function restrictFields(object &$data, array $fields = []): void
	{
		foreach ($fields as $field)
		{
			unset($data->$field);
		}
	}
}
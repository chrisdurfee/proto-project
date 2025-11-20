<?php declare(strict_types=1);
namespace Common\Services;

use Common\Services\Traits\ResponseTrait;

/**
 * Service
 *
 * This is a base class for services.
 *
 * @package Common\Services
 */
abstract class Service
{
	use ResponseTrait;

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
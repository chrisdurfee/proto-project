<?php declare(strict_types=1);

namespace Modules\Activity\Models;

use Proto\Models\Model;

/**
 * Activity
 * 
 * @package Modules\Activity\Models
 */
class Activity extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'activity';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'a';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'refId'
	];

}
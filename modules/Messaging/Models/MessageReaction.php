<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Proto\Models\Model;

/**
 * MessageReaction
 *
 * @package Modules\Messaging\Models
 */
class MessageReaction extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'message_reactions';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'mr';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'messageId',
		'userId',
		'emoji'
	];

}
<?php declare(strict_types=1);
namespace Modules\Client\Models\Conversation;

use Proto\Models\Model;

/**
 * ClientConversation
 *
 * @package Modules\Client\Models\Conversation
 */
class ClientConversation extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'client_conversations';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'co';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'clientId',
		'userId',
		'parentId',
		'message',
		'isInternal',
		'isPinned',
		'isEdited',
		'messageType',
		'attachmentCount',
		'editedAt',
		'createdAt',
		'updatedAt',
		'deletedAt'
	];

}
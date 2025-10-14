<?php declare(strict_types=1);
namespace Modules\Client\Models\Conversation;

use Proto\Models\Model;
use Modules\User\Models\User;

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

	/**
	 * Define joins for eager loading user data.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		/**
		 * Join the user who created the conversation message.
		 */
		$builder->one(User::class, fields: [
			'firstName',
			'lastName',
			'displayName',
			'image'
		])->on(['userId', 'id']);

		/**
		 * Join attachments for this conversation.
		 */
		$builder->many(ClientConversationAttachment::class, fields: [
			'id',
			'fileName',
			'filePath',
			'fileType',
			'fileExtension',
			'fileSize',
			'displayName',
			'description',
			'width',
			'height',
			'thumbnailPath'
		])->on(['id', 'conversationId']);
	}
}
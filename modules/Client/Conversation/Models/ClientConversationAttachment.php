<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Models;

use Proto\Models\Model;

/**
 * ClientConversationAttachment
 *
 * @package Modules\Client\Conversation\Models
 */
class ClientConversationAttachment extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'client_conversation_attachments';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'cca';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'conversationId',
		'uploadedBy',
		'fileName',
		'filePath',
		'fileType',
		'fileExtension',
		'fileSize',
		'displayName',
		'description',
		'downloadCount',
		'width',
		'height',
		'thumbnailPath',
		'createdAt',
		'updatedAt',
		'deletedAt'
	];

}

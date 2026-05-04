<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Models;

use Proto\Models\Model;
use Modules\Client\Conversation\Models\Factories\ClientConversationAttachmentFactory;

/**
 * ClientConversationAttachment
 *
 * @package Modules\Client\Conversation\Models
 * @method static ClientConversationAttachmentFactory factory(int $count = 1, array $attributes = [])
 */
class ClientConversationAttachment extends Model
{
	/**
	 * @var string|null $factory the factory class name
	 */
	protected static ?string $factory = ClientConversationAttachmentFactory::class;

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

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['conversationId', 'uploadedBy', 'createdAt'];
}

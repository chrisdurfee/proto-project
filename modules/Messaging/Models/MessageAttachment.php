<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Proto\Models\Model;

/**
 * MessageAttachment
 *
 * @package Modules\Messaging\Models
 */
class MessageAttachment extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'message_attachments';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ma';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'messageId',
		'fileUrl',
		'fileType',
		'fileName',
		'fileSize'
	];

	/**
	 * Get the message this attachment belongs to.
	 *
	 * @return mixed
	 */
	public function message()
	{
		return $this->belongsTo(Message::class);
	}
}
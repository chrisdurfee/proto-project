<?php declare(strict_types=1);
namespace Modules\Messaging\Models;

use Proto\Models\Model;
use Modules\User\Models\User;

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

	/**
	 * Get the message this reaction belongs to.
	 *
	 * @return mixed
	 */
	public function message()
	{
		return $this->belongsTo(Message::class);
	}

	/**
	 * Get the user who made this reaction.
	 *
	 * @return mixed
	 */
	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
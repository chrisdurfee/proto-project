<?php declare(strict_types=1);
namespace Modules\Messagin\Storage;

use Proto\Storage\Storage;

/**
 * ConversationParticipantStorage
 *
 * @package Modules\Messagin\Storage
 */
class ConversationParticipantStorage extends Storage
{
    /**
	 * Allow modifiers to adjust where clauses.
	 *
	 * @param array &$where Where clauses.
	 * @param array|null $modifiers Modifiers.
	 * @param array &$params Parameter array.
	 * @param mixed $filter Filter criteria.
	 * @return void
	 */
	protected static function setModifiers(array &$where = [], ?array $modifiers = null, array &$params = [], mixed $filter = null): void
	{
		if (empty($modifiers))
		{
			return;
		}

		// Handle 'unread' view filter
		if (isset($modifiers['view']) && $modifiers['view'] === 'unread')
		{
			$userId = $modifiers['userId'] ?? null;
			if ($userId)
			{
				// Add EXISTS subquery to filter conversations with unread messages
				$where[] = "EXISTS (SELECT 1 FROM messages m3 WHERE m3.conversation_id = cp.conversation_id AND m3.sender_id != {$userId} AND (m3.id > COALESCE(cp.last_read_message_id, 0)) AND m3.deleted_at IS NULL LIMIT 1)";
			}
		}
	}
}
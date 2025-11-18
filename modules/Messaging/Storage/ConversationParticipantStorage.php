<?php declare(strict_types=1);
namespace Modules\Messaging\Storage;

use Proto\Storage\Storage;

/**
 * ConversationParticipantStorage
 *
 * @package Modules\Messaging\Storage
 */
class ConversationParticipantStorage extends Storage
{
	/**
	 * (Optional) Sets a custom where clause.
	 *
	 * @param object $sql Query builder instance.
	 * @param array|null $modifiers Modifiers.
	 * @param array|null $params Parameter array.
	 * @return void
	 */
	protected function setCustomWhere(object $sql, ?array $modifiers = null, ?array &$params = null): void
	{
		if (empty($modifiers))
		{
			return;
		}

		if (!empty($modifiers['search']))
		{
			$search = '%' . $modifiers['search'] . '%';
			$sql->whereJoin('participants', [["firstName" => 'bruce']], $params);
		}

		// Handle 'unread' view filter
		if (isset($modifiers['view']) && $modifiers['view'] === 'unread')
		{
			$userId = $modifiers['userId'] ?? null;
			if ($userId)
			{
				// Add EXISTS subquery to filter conversations with unread messages
				$sql->where("EXISTS (SELECT 1 FROM messages m3 WHERE m3.conversation_id = cp.conversation_id AND m3.sender_id != ? AND (m3.id > COALESCE(cp.last_read_message_id, 0)) AND m3.deleted_at IS NULL LIMIT 1)");
                $params[] = $userId;
			}
		}
	}
}

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
	 * Allow modifiers to adjust where clauses.
	 *
	 * @param array &$where Where clauses.
	 * @param array|null $modifiers Modifiers.
	 * @param array &$params Parameter array.
	 * @param mixed $filter Filter criteria.
	 * @return void
	 */
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
		// Force output for debugging
		file_put_contents('/tmp/debug.log', "setCustomWhere called\n", FILE_APPEND);
		file_put_contents('/tmp/debug.log', "Modifiers: " . json_encode($modifiers) . "\n", FILE_APPEND);

		if (empty($modifiers))
		{
			return;
		}

		// Handle 'unread' view filter
		if (isset($modifiers['view']) && $modifiers['view'] === 'unread')
		{
			file_put_contents('/tmp/debug.log', "Unread view detected\n", FILE_APPEND);
			$userId = $modifiers['userId'] ?? null;
			if ($userId)
			{
				file_put_contents('/tmp/debug.log', "Adding WHERE clause for userId: {$userId}\n", FILE_APPEND);
				// Add EXISTS subquery to filter conversations with unread messages
				$sql->where("EXISTS (SELECT 1 FROM messages m3 WHERE m3.conversation_id = cp.conversation_id AND m3.sender_id != {$userId} AND (m3.id > COALESCE(cp.last_read_message_id, 0)) AND m3.deleted_at IS NULL LIMIT 1)");
			}
		}
	}
}

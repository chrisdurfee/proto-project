<?php declare(strict_types=1);
namespace Modules\Client\Note\Gateway;

use Modules\Client\Note\Models\ClientNote;

/**
 * Gateway
 *
 * @package Modules\Client\Note\Gateway
 */
class Gateway
{
	/**
	 * Get a note by ID.
	 *
	 * @param mixed $id
	 * @return ClientNote|null
	 */
	public function get(mixed $id): ?ClientNote
	{
		return ClientNote::get($id);
	}

	/**
	 * Create a new note.
	 *
	 * @param object $data
	 * @return ClientNote
	 */
	public function create(object $data): ClientNote
	{
		$note = new ClientNote($data);
		$note->add();
		return $note;
	}

	/**
	 * Update a note.
	 *
	 * @param object $data
	 * @return bool
	 */
	public function update(object $data): bool
	{
		$note = new ClientNote($data);
		return $note->update();
	}

	/**
	 * Delete a note.
	 *
	 * @param mixed $id
	 * @return bool
	 */
	public function delete(mixed $id): bool
	{
		return ClientNote::remove($id);
	}
}

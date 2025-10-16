<?php declare(strict_types=1);
namespace Modules\Client\Models;

use Proto\Models\Model;

/**
 * ClientNote
 *
 * @package Modules\Client\Models
 */
class ClientNote extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'client_notes';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'cn';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'clientId',
		'contactId',
		'title',
		'content',
		'noteType',
		'priority',
		'visibility',
		'status',
		'isPinned',
		'tags',
		'relatedToId',
		'relatedToType',
		'hasReminder',
		'reminderAt',
		'hasAttachments',
		'attachmentUrls',
		'requiresFollowUp',
		'followUpAt',
		'followUpNotes',
		'createdAt',
		'updatedAt',
		'createdBy',
		'updatedBy',
		'deletedAt'
	];

	/**
	 * Get searchable fields for the model.
	 *
	 * @return array
	 */
	public function getSearchableFields(): array
	{
		return [
			'id',
			'title',
			'content',
			'tags'
		];
	}

	/**
	 * Define eager-loaded joins for the model.
	 *
	 * @param mixed $builder
	 * @return void
	 */
	protected static function joins($builder): void
	{
		// Join with users table to get creator info
		$builder->leftJoin('users AS u_created', 'cn.createdBy', 'u_created.id')
			->addFields([
				'u_created.firstName AS createdByFirstName',
				'u_created.lastName AS createdByLastName',
				'u_created.image AS createdByImage',
				'CONCAT(u_created.firstName, " ", u_created.lastName) AS createdByName'
			]);
	}
}

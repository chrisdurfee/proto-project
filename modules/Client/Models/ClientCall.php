<?php declare(strict_types=1);
namespace Modules\Client\Models;

use Proto\Models\Model;

/**
 * ClientCall
 *
 * @package Modules\Client\Models
 */
class ClientCall extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'client_calls';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ccall';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'clientId',
		'contactId',
		'callType',
		'callStatus',
		'subject',
		'notes',
		'callerName',
		'callerPhone',
		'recipientName',
		'recipientPhone',
		'scheduledAt',
		'startedAt',
		'endedAt',
		'duration',
		'outcome',
		'outcomeNotes',
		'recordingUrl',
		'hasRecording',
		'requiresFollowUp',
		'followUpAt',
		'followUpNotes',
		'priority',
		'tags',
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
			'subject',
			'caller_name',
			'recipient_name',
			'caller_phone',
			'recipient_phone',
			'notes'
		];
	}
}

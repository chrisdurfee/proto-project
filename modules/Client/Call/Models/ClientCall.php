<?php declare(strict_types=1);
namespace Modules\Client\Call\Models;

use Proto\Models\Model;
use Modules\Client\Call\Models\Factories\ClientCallFactory;

/**
 * ClientCall
 *
 * @package Modules\Client\Call\Models
 * @method static ClientCallFactory factory(int $count = 1, array $attributes = [])
 */
class ClientCall extends Model
{
	/**
	 * @var string|null $factory the factory class name
	 */
	protected static ?string $factory = ClientCallFactory::class;

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
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['clientId', 'createdAt', 'createdBy'];

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

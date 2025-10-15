<?php declare(strict_types=1);
namespace Modules\Client\Models;

use Proto\Models\Model;

/**
 * ClientContact
 *
 * @package Modules\Client\Models
 */
class ClientContact extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'client_contacts';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'cc';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'clientId',
		'contactType',
		'isPrimary',
		'firstName',
		'lastName',
		'jobTitle',
		'department',
		'email',
		'phone',
		'mobile',
		'fax',
		'preferredContactMethod',
		'language',
		'timezone',
		'linkedinUrl',
		'twitterHandle',
		'marketingOptIn',
		'newsletterSubscribed',
		'status',
		'doNotContact',
		'emailBounced',
		'notes',
		'birthday',
		'assistantName',
		'assistantPhone',
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
			["CONCAT(cc.first_name, ' ', cc.last_name)"],
			["CONCAT(cc.last_name, ', ', cc.first_name)"]
		];
	}
}
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
		'userId',
		'contactType',
		'isPrimary',
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
		'contactStatus',
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
	 * Define joins for the ClientContact model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		$builder->one(\Modules\User\Models\User::class, fields: [
			'id',
			'username',
			'email',
			'firstName',
			'lastName',
			'displayName',
			'status',
			'enabled'
		])->on(['userId', 'id']);
	}

	/**
	 * This will get the user account.
	 *
	 * @return \Proto\Models\Relations\HasOne
	 */
	public function user(): \Proto\Models\Relations\HasOne
	{
		return $this->hasOne(\Modules\User\Models\User::class);
	}

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
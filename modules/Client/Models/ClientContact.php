<?php declare(strict_types=1);
namespace Modules\Client\Models;

use Modules\User\Models\User;
use Proto\Models\Model;
use Proto\Models\Relations\HasOne;

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
		$builder->one(User::class, fields: [
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
	 * @return HasOne
	 */
	public function user(): HasOne
	{
		return $this->hasOne(User::class);
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
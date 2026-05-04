<?php declare(strict_types=1);
namespace Modules\Client\Contact\Models;

use Modules\User\Main\Models\User;
use Proto\Models\Model;
use Proto\Models\Relations\HasOne;
use Modules\Client\Contact\Models\Factories\ClientContactFactory;

/**
 * ClientContact
 *
 * @package Modules\Client\Contact\Models
 * @method static ClientContactFactory factory(int $count = 1, array $attributes = [])
 */
class ClientContact extends Model
{
	/**
	 * @var string|null $factory the factory class name
	 */
	protected static ?string $factory = ClientContactFactory::class;

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
		'phone',
		'fax',
		'preferredContactMethod',
		'linkedinUrl',
		'twitterHandle',
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
	 * @var array Fields that cannot be changed after creation
	 */
	protected static array $immutableFields = ['clientId', 'createdAt', 'createdBy', 'deletedAt'];

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
			'image',
			'language',
			'timezone',
			'status',
			'enabled',
			'verified'
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
			'cc.id',
			'u.email',
			'cc.job_title',
			["CONCAT(u.first_name, ' ', u.last_name)"],
			["CONCAT(u.last_name, ', ', u.first_name)"]
		];
	}
}

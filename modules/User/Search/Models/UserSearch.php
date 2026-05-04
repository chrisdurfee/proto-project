<?php declare(strict_types=1);
namespace Modules\User\Search\Models;

use Proto\Models\Model;

/**
 * UserSearch
 *
 * A lightweight, read-only model exposing only safe public profile
 * fields for user search. No sensitive data (email, phone, address,
 * password, roles, permissions, privacy settings) is included.
 *
 * @property int $id
 * @property string $uuid
 * @property string $username
 * @property string|null $firstName
 * @property string|null $lastName
 * @property string|null $displayName
 * @property string|null $image
 * @property string|null $bio
 * @property string $status
 * @property int $verified
 * @property int $followerCount
 * @property int $followingCount
 *
 * @package Modules\User\Search\Models
 */
class UserSearch extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'users';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'u';

	/**
	 * Only safe, public-facing fields.
	 *
	 * @var array<string> $fields
	 */
	protected static array $fields = [
		'id',
		'uuid',
		'username',
		'firstName',
		'lastName',
		'displayName',
		'image',
		'bio',
		'status',
		'verified',
		'followerCount',
		'followingCount'
	];

	/**
	 * Get searchable fields for the model.
	 *
	 * @return array
	 */
	public function getSearchableFields(): array
	{
		return [
			'username',
			["CONCAT(u.first_name, ' ', u.last_name)"],
			["CONCAT(u.last_name, ', ', u.first_name)"]
		];
	}
}

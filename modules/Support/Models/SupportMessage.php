<?php declare(strict_types=1);
namespace Modules\Support\Models;

use Modules\User\Main\Models\User;
use Proto\Models\Model;

/**
 * SupportMessage Model
 *
 * Backs the Help Center contact, bug report, and support forms.
 *
 * @package Modules\Support\Models
 *
 * @method void __construct(?object $data = null)
 *
 * @property int $id
 * @property string $createdAt
 * @property string|null $updatedAt
 * @property int|null $userId
 * @property string $category
 * @property string $subject
 * @property string $message
 * @property string|null $email
 * @property string $status
 * @property string|null $resolvedAt
 * @property int|null $resolvedBy
 */
class SupportMessage extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'support_messages';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'sm';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'createdAt',
		'updatedAt',
		'userId',
		'category',
		'subject',
		'message',
		'email',
		'status',
		'resolvedAt',
		'resolvedBy'
	];

	/**
	 * The submitter and the original message may never be rewritten by a
	 * later update, so a staff status change cannot alter the report.
	 *
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = [
		'userId',
		'category',
		'subject',
		'message',
		'email'
	];

	/**
	 * @var array $searchableFields
	 */
	protected static array $searchableFields = [
		'subject',
		'message'
	];

	/**
	 * Define joins for the model.
	 *
	 * @param object $builder The query builder object
	 * @return void
	 */
	protected static function joins(object $builder): void
	{
		$builder
			->one(
				User::class,
				fields: ['displayName', 'firstName', 'lastName', 'email']
			)
			->on(['userId', 'id']);
	}
}

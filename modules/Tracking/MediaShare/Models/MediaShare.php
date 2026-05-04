<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Models;

use Proto\Models\PivotModel;
use Modules\Tracking\MediaShare\Models\Factories\MediaShareFactory;

/**
 * MediaShare Model
 *
 * Tracks when users share media items (vehicle photos, group media, etc.)
 *
 * @method static MediaShareFactory factory(int $count = 1, array $attributes = [])
 */
class MediaShare extends PivotModel
{
	/**
	 * @var string|null $tableName the table name
	 */
	protected static ?string $tableName = 'media_shares';

	/**
	 * @var string|null $alias the table alias
	 */
	protected static ?string $alias = 'ms';

	/**
	 * @var array $fields the model fields
	 */
	protected static array $fields = [
		'id',
		'userId',
		'mediaId',
		'mediaType',
		'shareType',
		'createdAt'
	];

	/**
	 * @var array<string> $immutableFields fields that cannot change after creation
	 */
	protected static array $immutableFields = ['userId', 'mediaId', 'mediaType', 'createdAt'];

	/**
	 * @var string|null $factory the factory class name
	 */
	protected static ?string $factory = MediaShareFactory::class;
}

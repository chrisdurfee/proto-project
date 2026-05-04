<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Models;

use Proto\Models\Model;
use Proto\Storage\DataTypes\JsonType;
use Modules\Tracking\Signals\Models\Factories\TrackingSignalFactory;

/**
 * TrackingSignal
 *
 * Represents a persisted domain event signal.
 *
 * @method static TrackingSignalFactory factory(int $count = 1, array $attributes = [])
 * @package Modules\Tracking\Signals\Models
 */
class TrackingSignal extends Model
{
	/**
	 * @var string|null $factory
	 */
	protected static ?string $factory = TrackingSignalFactory::class;

	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'tracking_signals';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'ts';

	/**
	 * @var array<string> $fields
	 */
	protected static array $fields = [
		'id',
		'uuid',
		'userId',
		'type',
		'metadata',
		'occurredAt',
		'createdAt',
	];

	/**
	 * @var array $immutableFields
	 */
	protected static array $immutableFields = ['uuid', 'userId', 'type', 'metadata', 'occurredAt', 'createdAt'];

	/**
	 * @var array<string, string> $dataTypes
	 */
	protected static array $dataTypes = [
		'metadata' => JsonType::class,
	];
}

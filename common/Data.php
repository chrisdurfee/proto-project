<?php declare(strict_types=1);
namespace Common;

use Proto\Patterns\Structural\Registry;

/**
 * Data
 *
 * Singleton registry class for managing shared data.
 *
 * @package Common
 */
class Data extends Registry
{
	/**
	 * The singleton instance.
	 *
	 * @var self|null
	 */
	protected static ?self $instance = null;
}
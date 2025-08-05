<?php declare(strict_types=1);
namespace Common;

use Proto\Patterns\Structural\Registry;

/**
 * Data
 *
 * This will allow data to be stored in a registry.
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
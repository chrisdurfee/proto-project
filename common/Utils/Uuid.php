<?php declare(strict_types=1);

namespace Common\Utils;

/**
 * UUID utility class.
 *
 * Provides static methods for generating universally unique identifiers
 * without requiring a class instance.
 */
class Uuid
{
	/**
	 * Generate a UUID v4 string.
	 *
	 * @return string
	 */
	public static function v4(): string
	{
		$data = random_bytes(16);
		$data[6] = chr(ord($data[6]) & 0x0f | 0x40);
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80);
		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
	}
}

<?php declare(strict_types=1);

namespace Common\Storage\DataTypes;

use Proto\Storage\DataTypes\PointType as BasePointType;

/**
 * PointType
 *
 * Round-trip-safe MySQL POINT handler.
 *
 * Proto's base {@see BasePointType} writes a `POINT(?, ?)` placeholder but
 * leaves {@see fromDb()} as a no-op, so a raw `position` column read back from
 * MySQL stays as the internal geometry binary (4-byte SRID + WKB). The moment
 * that value is re-persisted — e.g. a load-modify-save flow that fetches the
 * full row, mutates one field and calls `update()` — the binary blob is fed
 * straight into `POINT(?, ?)` and MySQL rejects it with
 * "Truncated incorrect DOUBLE value".
 *
 * Decoding the stored geometry back into the canonical `"longitude latitude"`
 * string here closes the loop: reads return a value that `toParams()` can
 * re-serialise into a valid `POINT(?, ?)` on the next write.
 *
 * @package Common\Storage\DataTypes
 */
class PointType extends BasePointType
{
	/**
	 * Decode a stored POINT value into the `"longitude latitude"` string the
	 * write path expects.
	 *
	 * Handles MySQL's internal geometry binary (SRID + WKB), bare WKB, WKT
	 * text (`POINT(x y)`), and already-decoded `"x y"` strings.
	 *
	 * @param mixed $value Raw value from the database.
	 * @return mixed
	 */
	public function fromDb(mixed $value): mixed
	{
		if ($value === null || $value === '' || !is_string($value))
		{
			return $value;
		}

		// Textual values never contain NUL bytes — treat them as WKT or an
		// already-decoded coordinate pair.
		if (strpos($value, "\0") === false)
		{
			if (stripos($value, 'POINT') !== false)
			{
				return preg_match('/(-?\d[\d.eE+-]*)[\s,]+(-?\d[\d.eE+-]*)/', $value, $m)
					? $m[1] . ' ' . $m[2]
					: null;
			}

			return $value;
		}

		// Binary geometry: strip the 4-byte SRID prefix MySQL prepends to the
		// internal storage format, leaving the standard 21-byte point WKB.
		$wkb = (strlen($value) === 25) ? substr($value, 4) : $value;
		return $this->parseWkbPoint($wkb);
	}

	/**
	 * Parse a Well-Known Binary point into a `"x y"` string.
	 *
	 * WKB point layout: 1 byte byte-order, 4 byte type, 8 byte X, 8 byte Y.
	 *
	 * @param string $wkb
	 * @return string|null
	 */
	private function parseWkbPoint(string $wkb): ?string
	{
		if (strlen($wkb) < 21)
		{
			return null;
		}

		// Byte order: 1 = little-endian (NDR), 0 = big-endian (XDR).
		$code = (ord($wkb[0]) === 0) ? 'E' : 'e';
		$coords = @unpack("{$code}x/{$code}y", substr($wkb, 5, 16));
		if (!is_array($coords) || !isset($coords['x'], $coords['y']))
		{
			return null;
		}

		return $coords['x'] . ' ' . $coords['y'];
	}
}

<?php declare(strict_types=1);
namespace Common\Http;

/**
 * UploadedFiles
 *
 * Peek whether a multipart field has files without constructing
 * UploadFile (which renames temp files). Mirrors the existence
 * check inside Request::fileArray() so callers can decide whether
 * to run validation/storage later.
 *
 * @package Common\Http
 */
class UploadedFiles
{
	/**
	 * True when $_FILES[$field] has at least one non-empty name.
	 *
	 * @param string $field
	 * @return bool
	 */
	public static function has(string $field): bool
	{
		$raw = $_FILES[$field] ?? null;
		if (empty($raw) || empty($raw['name']))
		{
			return false;
		}

		if (is_array($raw['name']))
		{
			foreach ($raw['name'] as $name)
			{
				if ($name !== '' && $name !== null)
				{
					return true;
				}
			}

			return false;
		}

		return $raw['name'] !== '';
	}
}

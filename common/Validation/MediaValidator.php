<?php declare(strict_types=1);

namespace Common\Validation;

use Proto\Http\UploadFile;

/**
 * MediaValidator
 *
 * Project-side replacement for Proto's FileValidator that correctly
 * handles modern image formats (AVIF, HEIC, HEIF, JXL).
 *
 * Background: Proto\Api\FileValidator::parseMimeTypes() ships with an
 * incomplete extension→MIME map that silently drops 'avif', 'heic',
 * 'heif', and 'jxl'. Combined with its strict actual-MIME check
 * (via finfo) this causes any AVIF/HEIC/HEIF/JXL upload to fail with
 * "File content does not match its declared type" even when the rule
 * string explicitly whitelists them.
 *
 * This validator instead uses UploadFile::getMimeType(), which already
 * has the necessary extension-fallback for finfo blind spots.
 *
 * @package Common\Validation
 */
class MediaValidator
{
	/**
	 * Canonical extension → MIME map used to build allow-lists.
	 * Mirrors UploadFile::$extensionMimeMap for image formats and
	 * adds the document/video types accepted by mixed-media uploads.
	 *
	 * @var array<string, string>
	 */
	protected static array $extensionToMime = [
		'jpeg' => 'image/jpeg',
		'jpg' => 'image/jpeg',
		'png' => 'image/png',
		'gif' => 'image/gif',
		'webp' => 'image/webp',
		'bmp' => 'image/bmp',
		'tiff' => 'image/tiff',
		'svg' => 'image/svg+xml',
		'heic' => 'image/heic',
		'heif' => 'image/heif',
		'avif' => 'image/avif',
		'jxl' => 'image/jxl',
		'mp4' => 'video/mp4',
		'mov' => 'video/quicktime',
		'avi' => 'video/x-msvideo',
		'webm' => 'video/webm',
		'mpeg' => 'video/mpeg',
		'pdf' => 'application/pdf',
		'doc' => 'application/msword',
		'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xls' => 'application/vnd.ms-excel',
		'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'ppt' => 'application/vnd.ms-powerpoint',
		'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'txt' => 'text/plain',
		'csv' => 'text/csv',
		'zip' => 'application/zip',
		'rar' => 'application/x-rar-compressed',
		'7z' => 'application/x-7z-compressed'
	];

	/**
	 * Validates an uploaded file against a comma-separated extension list.
	 *
	 * @param UploadFile $file The uploaded file.
	 * @param int $maxSizeKb Maximum allowed size in KB.
	 * @param string $allowedExtensions Comma-separated extensions (e.g. "jpeg,png,avif").
	 * @return array{valid: bool, errors: array<int, string>}
	 */
	public static function validate(UploadFile $file, int $maxSizeKb, string $allowedExtensions): array
	{
		$errors = [];

		$path = $file->getFilePath();
		if (!is_file($path) || !is_readable($path) || $file->getSize() <= 0)
		{
			return ['valid' => false, 'errors' => ['File upload failed or file is empty']];
		}

		if (($file->getSize() / 1024) > $maxSizeKb)
		{
			$errors[] = "File size exceeds maximum allowed size of {$maxSizeKb}KB";
		}

		$extensions = static::parseExtensions($allowedExtensions);
		$ext = strtolower($file->getExtension());
		if (!in_array($ext, $extensions, true))
		{
			$errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $extensions);
		}

		$allowedMimes = static::extensionsToMimes($extensions);
		$actualMime = $file->getMimeType();
		if (!in_array($actualMime, $allowedMimes, true))
		{
			$errors[] = 'File content does not match its declared type';
		}

		if ($file->containsDangerousContent())
		{
			$errors[] = 'File contains disallowed content';
		}

		return [
			'valid' => empty($errors),
			'errors' => $errors
		];
	}

	/**
	 * Normalises a "jpeg,png,avif" string into a unique lowercase extension list.
	 *
	 * @param string $extensions
	 * @return array<int, string>
	 */
	protected static function parseExtensions(string $extensions): array
	{
		$parts = array_filter(array_map(
			static fn(string $e): string => strtolower(trim($e)),
			explode(',', $extensions)
		));

		return array_values(array_unique($parts));
	}

	/**
	 * Maps an extension list to the corresponding MIME type allow-list.
	 *
	 * @param array<int, string> $extensions
	 * @return array<int, string>
	 */
	protected static function extensionsToMimes(array $extensions): array
	{
		$mimes = [];
		foreach ($extensions as $ext)
		{
			if (isset(static::$extensionToMime[$ext]))
			{
				$mimes[] = static::$extensionToMime[$ext];
			}
		}

		return array_values(array_unique($mimes));
	}
}

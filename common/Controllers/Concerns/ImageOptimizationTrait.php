<?php declare(strict_types=1);
namespace Common\Controllers\Concerns;

use Common\Media\ImageProcessor;
use Common\Media\ImagePresets;
use Proto\Http\Router\Request;

/**
 * ImageOptimizationTrait
 *
 * Controller-level wrapper around {@see ImageProcessor::process()} for
 * entities that store a single image (avatar/cover/logo/banner) directly on
 * the parent row (no `*_media` table). Pairs with
 * {@see \Proto\Controllers\Traits\FileUploadTrait::handleFileUpload()}.
 *
 * Typical usage in `modifyAddItem` / `modifyUpdateItem`:
 *
 *   $upload = $this->handleOptimizedImageUpload(
 *       $request, 'coverImage', 'groups', ImagePresets::COVER,
 *       'image:10240|mimes:jpeg,png,gif,bmp,tiff,webp,jxl,heic,heif,avif'
 *   );
 *   if ($upload !== null)
 *   {
 *       $data->coverImage = $upload['mainFile'];
 *       $data->coverImageVariants = $upload['variants'];
 *   }
 */
trait ImageOptimizationTrait
{
	/**
	 * Validate + store an uploaded image, then run it through
	 * {@see ImageProcessor::process()} so derivative variants (thumb, card,
	 * large) are generated next to the original.
	 *
	 * Returns null when no file was provided. When Imagick is unavailable
	 * or the processor fails, the original (stored) filename is returned
	 * with an empty variants map so callers can still save the row.
	 *
	 * @param Request $request
	 * @param string $fieldName Form field name (e.g. 'coverImage').
	 * @param string $bucket Vault bucket / directory (e.g. 'groups').
	 * @param array<int, array<string, mixed>> $presets {@see ImagePresets}.
	 * @param string $rules Validation rules for {@see handleFileUpload()}.
	 * @param array<string, mixed>|null $originalOptions Override options for
	 *   re-encoding the original (defaults to {@see ImagePresets::ORIGINAL_PROFILE}).
	 * @param string $disk Vault disk name.
	 * @return array{mainFile:string, variants: array<string,string>|null}|null
	 */
	protected function handleOptimizedImageUpload(
		Request $request,
		string $fieldName,
		string $bucket,
		array $presets,
		string $rules = 'image:10240',
		?array $originalOptions = null,
		string $disk = 'local'
	): ?array
	{
		$filename = $this->handleFileUpload($request, $fieldName, $disk, $bucket, $rules);
		if (!$filename)
		{
			return null;
		}

		$result = ImageProcessor::process(
			$disk,
			$bucket,
			$filename,
			$presets,
			$originalOptions ?? ImagePresets::ORIGINAL_PROFILE
		);

		if ($result === null)
		{
			return [
				'mainFile' => $filename,
				'variants' => null,
			];
		}

		return [
			'mainFile' => (string)($result['mainFile'] ?? $filename),
			'variants' => $result['variants'] ?? null,
		];
	}
}

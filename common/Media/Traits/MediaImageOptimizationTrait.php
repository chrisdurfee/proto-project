<?php declare(strict_types=1);

namespace Common\Media\Traits;

use Common\Media\ImageProcessor;
use Common\Media\ImagePresets;

/**
 * MediaImageOptimizationTrait
 *
 * Shared wiring for `*MediaService` classes that handle uploads stored on the
 * `local` Vault disk. Add the trait to a service, then between
 * `$file->store(...)` and `$media->add()` call:
 *
 *   $this->optimizeUploadedImage($media, $file, 'posts');
 *
 * and in your delete path, after deleting the main file from Vault:
 *
 *   $this->deleteOptimizedImage($media, 'posts');
 *
 * The trait is a no-op for non-image media (videos, documents) and degrades
 * gracefully when Imagick isn't available.
 */
trait MediaImageOptimizationTrait
{
	/**
	 * Re-encode the original (HEIC → WebP, large images downsized, EXIF
	 * stripped) and generate `thumb`/`card`/`large` variants. Mutates the
	 * $media object in place so `->add()` saves the optimized values.
	 *
	 * @param object $media In-progress media model (filename, path, type,
	 *   mimeType, fileSize, width, height, variants).
	 * @param object $file UploadFile instance returned by Proto.
	 * @param string $bucket Vault bucket name (e.g. 'posts', 'articles').
	 * @return void
	 */
	protected function optimizeUploadedImage(object $media, object $file, string $bucket): void
	{
		if (($media->type ?? null) !== 'image')
		{
			return;
		}
		if (!method_exists($file, 'isImageFile') || !$file->isImageFile())
		{
			return;
		}

		$filename = (string)($media->filename ?? '');
		if ($filename === '')
		{
			return;
		}

		$result = ImageProcessor::process(
			'local',
			$bucket,
			$filename,
			ImagePresets::MEDIA,
			ImagePresets::ORIGINAL_MEDIA
		);
		if ($result === null)
		{
			return;
		}

		$mainFile = $result['mainFile'] ?? $filename;
		$media->filename = $mainFile;
		$media->path = '/files/' . $bucket . '/' . $mainFile;
		if (!empty($result['mimeType']))
		{
			$media->mimeType = $result['mimeType'];
		}
		if (!empty($result['fileSize']))
		{
			$media->fileSize = (int)$result['fileSize'];
		}
		if (!empty($result['width']))
		{
			$media->width = (int)$result['width'];
		}
		if (!empty($result['height']))
		{
			$media->height = (int)$result['height'];
		}
		$media->variants = $result['variants'] ?? null;
	}

	/**
	 * Delete any variant files associated with the media record. Safe to
	 * call even when no variants exist.
	 *
	 * @param object $media
	 * @param string $bucket
	 * @return void
	 */
	protected function deleteOptimizedImage(object $media, string $bucket): void
	{
		$variants = is_array($media->variants ?? null) ? $media->variants : null;
		ImageProcessor::deleteVariants('local', $bucket, $variants);
	}
}

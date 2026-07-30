<?php declare(strict_types=1);

namespace Common\Media;

/**
 * ImagePresets
 *
 * Named, app-wide preset bundles for {@see ImageProcessor::process()}.
 *
 * Centralizing presets here means every upload area produces the same set of
 * sizes, so a future redesign or a new variant only changes one file.
 *
 *   $presets = ImagePresets::AVATAR;
 *   ImageProcessor::process('local', 'users', $filename, $presets, [...]);
 */
class ImagePresets
{
	/**
	 * Square avatar variants (lists, comments, headers).
	 *
	 * @var array<int, array<string, mixed>>
	 */
	public const AVATAR = [
		['name' => 'thumb', 'mode' => 'square', 'width' => 128, 'quality' => 82],
		['name' => 'card',  'mode' => 'fit',    'width' => 400, 'height' => 400, 'quality' => 82],
	];

	/**
	 * Wide cover-image variants (profile + group covers).
	 *
	 * @var array<int, array<string, mixed>>
	 */
	public const COVER = [
		['name' => 'thumb', 'mode' => 'width', 'width' => 560,  'quality' => 80],
		['name' => 'card',  'mode' => 'width', 'width' => 1600, 'quality' => 82],
	];

	/**
	 * Generic content media (post, article, event, and other entity photos).
	 * `large` doubles as a high-quality reference; the original itself is
	 * also re-encoded by {@see ImageProcessor::process()}.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	public const MEDIA = [
		['name' => 'thumb', 'mode' => 'fit',   'width' => 320,  'height' => 320,  'quality' => 80],
		['name' => 'card',  'mode' => 'width', 'width' => 800,  'quality' => 82],
		['name' => 'large', 'mode' => 'width', 'width' => 1600, 'quality' => 84],
	];

	/**
	 * Default options for re-encoding originals on profile/cover uploads.
	 *
	 * @var array<string, mixed>
	 */
	public const ORIGINAL_PROFILE = [
		'reencodeOriginal' => true,
		'originalMaxDim' => 2048,
		'originalQuality' => 85,
		'format' => 'auto',
	];

	/**
	 * Default options for re-encoding originals on content media uploads.
	 *
	 * @var array<string, mixed>
	 */
	public const ORIGINAL_MEDIA = [
		'reencodeOriginal' => true,
		'originalMaxDim' => 2560,
		'originalQuality' => 85,
		'format' => 'auto',
	];
}

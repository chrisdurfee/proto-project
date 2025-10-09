<?php declare(strict_types=1);
namespace Common\Services\OpenAi\Chat;

/**
 * ModelHelper
 *
 * Chooses a canonical OpenAI model id from user/legacy inputs.
 * - Supports latest model families (GPT-5, 4.1, 4o, o1/o3/o4-mini, realtime, transcribe, image, OSS).
 * - Accepts dated snapshots (e.g., gpt-4.1-2025-04-14) as-is.
 * - Normalizes legacy aliases (e.g., "gpt-4" -> "gpt-4o").
 */
final class ModelHelper
{
	/**
	 * Canonical model ids supported (keep in sync with OpenAI docs).
	 * @var array<string, true>
	 */
	private const SUPPORTED = [
		// GPT family
		'gpt-5' => true,
		'gpt-5-mini' => true,
		'gpt-4.1' => true,
		'gpt-4.1-mini' => true,
		'gpt-4.1-nano' => true,
		'gpt-4o' => true,
		'gpt-4o-mini' => true,

		// Reasoning series
		'o1' => true,
		'o1-mini' => true,
		'o1-pro' => true,
		'o3' => true,
		'o4-mini' => true,

		// Realtime + speech/text (only if your app uses them)
		'gpt-realtime' => true,
		'gpt-4o-transcribe' => true,
		'gpt-4o-mini-transcribe' => true,

		// Image generation
		'gpt-image-1' => true,
		'gpt-image-1-mini' => true,

		// Open-weight models
		'gpt-oss-20b' => true,
		'gpt-oss-120b' => true,

		// Legacy but still around
		'gpt-3.5-turbo' => true,
		'gpt-3.5-turbo-16k' => true,
	];

	/**
	 * Legacy names and aliases -> canonical ids.
	 * @var array<string, string>
	 */
	private const ALIASES = [
		'gpt-4' => 'gpt-4o',
		'gpt4' => 'gpt-4o',
		'gpt-4o-mini-high' => 'gpt-4o-mini', // normalize custom alias
		'gpt-4.5' => 'gpt-4.1',              // unofficial -> closest public
		'gpt-3.5' => 'gpt-3.5-turbo',
	];

	/**
	 * Return the model id to use.
	 *
	 * - If a known model (or snapshot) is requested, return it as-is.
	 * - Else normalize via ALIASES.
	 * - Else default to gpt-4o.
	 *
	 * @param object|null $settings Optional settings object with ->model
	 */
	public static function get(?object $settings = null): string
	{
		$requested = \is_object($settings) ? ($settings?->model ?? null) : null;
		if (\is_string($requested) && $requested !== '')
		{
			// Accept official dated snapshots: e.g., gpt-4.1-2025-04-14
			if (\preg_match('/^[a-z0-9][a-z0-9.\-]*\d{4}-\d{2}-\d{2}$/', $requested) === 1)
			{
				return $requested;
			}

			$normalized = \strtolower($requested);

			if (isset(self::SUPPORTED[$normalized]))
			{
				return $normalized;
			}

			if (isset(self::ALIASES[$normalized]))
			{
				return self::ALIASES[$normalized];
			}
		}

		return 'gpt-4o';
	}
}

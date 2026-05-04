<?php declare(strict_types=1);

/**
 * Generate Cover Images for Drives
 *
 * This script uses OpenAI's gpt-image-1 model to generate photorealistic
 * cover images for drives that don't have one yet.
 *
 * Usage (from Docker container):
 *   php infrastructure/scripts/generate-drive-covers.php
 *
 * Options:
 *   --limit=N      Max number of drives to process (default: all)
 *   --dry-run      Show prompts without generating images
 *   --drive-id=N   Generate for a specific drive ID only
 *   --continue-on-billing-limit Continue processing after a billing/quota error
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Modules\Community\Driving\Main\Models\Drive;
use Proto\Utils\Files\File;
use Proto\Utils\Format\JsonFormat;
use Proto\Base;

/**
 * Enable error tracking for debugging
 */
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

/**
 * Initialize the Proto framework
 */
new Base();

// ---------------------------------------------------------------------------
// Parse CLI options
// ---------------------------------------------------------------------------

$options = getopt('', ['limit:', 'dry-run', 'drive-id:', 'continue-on-billing-limit']);
$limit = isset($options['limit']) ? (int)$options['limit'] : 0;
$dryRun = isset($options['dry-run']);
$driveId = isset($options['drive-id']) ? (int)$options['drive-id'] : 0;
$stopOnBillingLimit = !isset($options['continue-on-billing-limit']);

// ---------------------------------------------------------------------------
// Resolve storage path
// ---------------------------------------------------------------------------

$storagePath = dirname(__DIR__, 2) . '/public/files/drives';
if (!is_dir($storagePath))
{
	mkdir($storagePath, 0755, true);
	echo "Created directory: {$storagePath}\n";
}

// ---------------------------------------------------------------------------
// Fetch drives needing cover images
// ---------------------------------------------------------------------------

if ($driveId > 0)
{
	$drive = Drive::getWithoutJoins($driveId);
	if (!$drive)
	{
		echo "Drive ID {$driveId} not found.\n";
		exit(1);
	}
	$drives = [$drive];
}
else
{
	$filter = [
		['d.cover_image IS NULL OR d.cover_image = ?', ['']],
		['d.deleted_at IS NULL'],
	];
	$modifiers = ['orderBy' => 'd.id ASC'];

	if ($limit > 0)
	{
		$result = Drive::all($filter, 0, $limit, $modifiers);
	}
	else
	{
		$result = Drive::all($filter, 0, 500, $modifiers);
	}

	$drives = $result->rows ?? [];
}

$total = count($drives);
if ($total === 0)
{
	echo "No drives need cover images.\n";
	exit(0);
}

echo "Found {$total} drive(s) needing cover images.\n\n";

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build a photorealistic image prompt for a drive location.
 *
 * @param object $drive
 * @return string
 */
function buildPrompt(object $drive): string
{
	$category = $drive->driveCategory ?? 'scenic';
	$title = $drive->title ?? 'Unknown Drive';
	$city = $drive->city ?? '';
	$state = $drive->state ?? '';
	$description = $drive->description ?? '';
	$surface = $drive->surfaceType ?? 'paved';

	$location = trim("{$city}, {$state}");

	// Extract key visual details from the description (first two sentences)
	$sentences = preg_split('/(?<=[.!?])\s+/', $description, 4);
	$shortDesc = implode(' ', array_slice($sentences, 0, 2));
	if (strlen($shortDesc) > 300)
	{
		// Fall back to first sentence if combined is too long
		$shortDesc = $sentences[0] ?? $description;
	}

	// Category-specific scene direction
	$sceneDirection = match ($category)
	{
		'track' => "an aerial or elevated wide-angle view of the {$title} motorsports racetrack near {$location}, "
			. "showing the circuit layout with smooth dark asphalt, painted curbing, and well-maintained grass runoff areas. "
			. "The track surface has natural tire rubber marks.",
		'canyon' => "a dramatic wide-angle photograph looking down a winding canyon road at {$title} near {$location}. "
			. "The road curves through rugged terrain with rock walls, steep drops, and natural vegetation.",
		'scenic' => "a stunning wide-angle landscape photograph of the road at {$title} near {$location}. "
			. "The highway stretches into an epic vista with dramatic natural scenery characteristic of the region.",
		'cruise' => "a beautiful wide-angle photograph of the road at {$title} near {$location}, "
			. "showing a smooth highway stretching through scenic surroundings with inviting open road ahead.",
		'offroad' => "a dramatic photograph of the {$title} off-road trail near {$location}, "
			. "showing the rugged {$surface} terrain with natural obstacles and wilderness landscape.",
		default => "a beautiful photograph of the driving road at {$title} near {$location} with compelling scenery.",
	};

	// Time/lighting based on category
	$lightingHint = match ($category)
	{
		'track' => 'Bright daylight with crisp shadows.',
		'canyon' => 'Golden hour sunlight casting warm light on the rock faces.',
		'scenic' => 'Dramatic natural lighting with depth and atmosphere.',
		'offroad' => 'Clear sky with strong directional sunlight revealing terrain texture.',
		default => 'Golden hour with warm, natural light.',
	};

	$prompt = "Photorealistic photograph: {$sceneDirection} "
		. "Context: {$shortDesc} "
		. "{$lightingHint} "
		. "Shot on a professional full-frame camera with a wide-angle lens. "
		. "Hyper-realistic with natural colors, sharp detail, and cinematic composition. "
		. "No text overlays, no watermarks, no humans, no vehicles visible. "
		. "Quality: National Geographic or automotive magazine cover.";

	return $prompt;
}

/**
 * Determine if an API error indicates a billing/quota hard-stop condition.
 *
 * @param string $message
 * @return bool
 */
function isBillingLimitError(string $message): bool
{
	$normalized = strtolower($message);

	return str_contains($normalized, 'billing hard limit has been reached')
		|| str_contains($normalized, 'insufficient_quota')
		|| str_contains($normalized, 'quota exceeded');
}

// ---------------------------------------------------------------------------
// OpenAI client — use underlying API directly for gpt-image-1 model support
// ---------------------------------------------------------------------------

$apiClient = null;
if (!$dryRun)
{
	$apiKey = env('apis')->openAi->key ?? null;
	if (empty($apiKey))
	{
		echo "ERROR: OpenAI API key not configured. Set apis.openAi.key in common/Config/.env\n";
		exit(1);
	}

	$apiClient = new \Orhanerday\OpenAi\OpenAi($apiKey);
	$apiClient->setTimeout(180);
}

// ---------------------------------------------------------------------------
// Process each drive
// ---------------------------------------------------------------------------

$success = 0;
$failed = 0;
$failedDriveIds = [];
$abortedForBilling = false;

foreach ($drives as $index => $drive)
{
	$num = $index + 1;
	$driveTitle = $drive->title ?? "Drive #{$drive->id}";
	echo "[{$num}/{$total}] {$driveTitle}\n";

	$prompt = buildPrompt($drive);

	if ($dryRun)
	{
		echo "  PROMPT: {$prompt}\n\n";
		continue;
	}

	echo "  Generating image...\n";

	try
	{
		// Use gpt-image-1 for photorealistic output via direct API call
		$response = $apiClient->image([
			'model' => 'gpt-image-1',
			'prompt' => $prompt,
			'n' => 1,
			'size' => '1536x1024',
			'quality' => 'high',
			'output_format' => 'png',
		]);

		$result = JsonFormat::decode($response);

		if (!$result || isset($result->error))
		{
			$errorMsg = $result->error->message ?? 'Unknown error';
			echo "  ERROR: {$errorMsg}\n\n";
			$failed++;
			$failedDriveIds[] = (int)$drive->id;

			if ($stopOnBillingLimit && isBillingLimitError($errorMsg))
			{
				echo "  Stopping early due to OpenAI billing/quota limit.\n\n";
				$abortedForBilling = true;
				break;
			}

			continue;
		}

		// Extract image URL from response
		$imageUrl = $result->data[0]->url ?? null;
		$imageB64 = $result->data[0]->b64_json ?? null;

		if (!$imageUrl && !$imageB64)
		{
			echo "  ERROR: No image data in response.\n\n";
			$failed++;
			$failedDriveIds[] = (int)$drive->id;
			continue;
		}

		// Download or decode the image
		if ($imageB64)
		{
			$imageData = base64_decode($imageB64);
		}
		else
		{
			$imageData = File::get($imageUrl, true);
		}

		if (!$imageData || strlen($imageData) === 0)
		{
			echo "  ERROR: Failed to retrieve image data.\n\n";
			$failed++;
			$failedDriveIds[] = (int)$drive->id;
			continue;
		}

		// Validate it's actually an image
		$imageInfo = @getimagesizefromstring($imageData);
		if (!$imageInfo)
		{
			echo "  ERROR: Downloaded data is not a valid image.\n\n";
			$failed++;
			$failedDriveIds[] = (int)$drive->id;
			continue;
		}

		$mimeType = $imageInfo['mime'] ?? 'image/png';
		$ext = match ($mimeType)
		{
			'image/png' => 'png',
			'image/jpeg', 'image/jpg' => 'jpg',
			'image/webp' => 'webp',
			default => 'png',
		};

		// Generate a unique filename
		$filename = 'drive-cover-' . $drive->id . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
		$filePath = $storagePath . '/' . $filename;

		if (!File::put($filePath, $imageData))
		{
			echo "  ERROR: Failed to write file to {$filePath}\n\n";
			$failed++;
			$failedDriveIds[] = (int)$drive->id;
			continue;
		}

		// Update the drive record with the cover image filename
		Drive::builder()
			->update()
			->set(['cover_image' => $filename])
			->where('id = ?')
			->execute([(int)$drive->id]);

		$sizeKB = round(strlen($imageData) / 1024);
		echo "  Saved: {$filename} ({$sizeKB} KB)\n\n";
		$success++;
	}
	catch (\Throwable $e)
	{
		$errorMsg = $e->getMessage();
		echo "  EXCEPTION: {$errorMsg}\n\n";
		$failed++;
		$failedDriveIds[] = (int)$drive->id;

		if ($stopOnBillingLimit && isBillingLimitError($errorMsg))
		{
			echo "  Stopping early due to OpenAI billing/quota limit.\n\n";
			$abortedForBilling = true;
			break;
		}
	}

	// Rate limit: avoid hammering the API
	if ($index < $total - 1)
	{
		sleep(2);
	}
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

echo "=== Done ===\n";
if ($dryRun)
{
	echo "Dry run completed. No images were generated.\n";
}
else
{
	echo "Success: {$success} | Failed: {$failed} | Total: {$total}\n";

	if ($abortedForBilling)
	{
		echo "Run aborted early due to billing/quota hard limit.\n";
	}

	if (!empty($failedDriveIds))
	{
		echo 'Failed drive IDs: ' . implode(', ', $failedDriveIds) . "\n";
	}
}

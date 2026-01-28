<?php declare(strict_types=1);
namespace Modules\User\Main\Services;

use Modules\User\Main\Models\User;
use Proto\Controllers\Response;
use Proto\Http\UploadFile;
use Proto\Utils\Files\File;

/**
 * UserImageService
 *
 * This service handles user profile image upload operations.
 *
 * @package Modules\User\Services\User
 */
class UserImageService
{
	/**
	 * Stores the uploaded image file.
	 *
	 * @param UploadFile $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return object Returns Response object with success/error data
	 */
	public function storeImage(UploadFile $uploadFile, int $userId): object
	{
		try
		{
			/**
			 * Store the file using the Vault system.
			 */
			$storedPath = $uploadFile->store('local', 'users');
			if (!$storedPath)
			{
				return Response::invalid('Failed to store the image file.');
			}

			/**
			 * Get the stored filename and generate display filename.
			 */
			$storedFileName = $uploadFile->getNewName();
			$displayFileName = $this->generateFileName($storedFileName, $uploadFile, $userId);

			return Response::success([
				'path' => $storedFileName, // This is the actual stored filename that can be used to retrieve the file
				'filename' => $displayFileName
			]);
		}
		catch (\Exception $e)
		{
			return Response::invalid('Failed to store image: ' . $e->getMessage());
		}
	}

	/**
	 * Updates the user's image field in the database.
	 *
	 * @param int $userId The user ID.
	 * @param string $fileName The stored file name.
	 * @return object Returns Response object with success/error data
	 */
	public function updateUserImage(int $userId, string $fileName): object
	{
		try
		{
			$user = User::get($userId);
			if (!$user)
			{
				return Response::invalid('User not found.');
			}

			// Set the image field and update
			$user->image = $fileName;
			$result = $user->update();
			if ($result)
			{
				return Response::success(['updated' => true]);
			}

			return Response::invalid('Failed to update user image reference.');
		}
		catch (\Exception $e)
		{
			return Response::invalid('Database update failed: ' . $e->getMessage());
		}
	}

	/**
	 * Uploads and processes a user image (complete workflow).
	 *
	 * @param UploadFile|null $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return object Returns Response object with success/error data
	 */
	public function uploadUserImage(?UploadFile $uploadFile, int $userId): object
	{
		/**
		 * Store the image (validation is handled at controller level).
		 */
		$storage = $this->storeImage($uploadFile, $userId);
		if (!$storage->success)
		{
			return $storage; // Return the storage error response
		}

		/**
		 * Update user record.
		 */
		$update = $this->updateUserImage($userId, $storage->filename);
		if (!$update->success)
		{
			return $update; // Return the update error response
		}

		/**
		 * Return success with data.
		 */
		return Response::success([
			'image' => $storage->filename,
			'path' => $storage->path,
			'message' => 'Image uploaded successfully.'
		]);
	}

	/**
	 * Generates a filename for the stored image.
	 *
	 * @param string $storedFileName The stored file name from Vault.
	 * @param UploadFile $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return string The generated filename.
	 */
	private function generateFileName(string $storedFileName, UploadFile $uploadFile, int $userId): string
	{
		if (empty($storedFileName))
		{
			$storedFileName = File::generateFileName($uploadFile, 'user_' . $userId);
		}

		return $storedFileName;
	}

	/**
	 * Imports a user image from a URL (e.g. Google Profile).
	 *
	 * @param string $url The image URL.
	 * @param int $userId The user ID.
	 * @return object Returns Response object.
	 */
	public function importFromUrl(string $url, int $userId): object
	{
		try
		{
			// Download the image content
			$content = File::get($url, true);
			if ($content === false)
			{
				return Response::invalid('Failed to download image from URL.');
			}

			// Create a temporary file
			$tmpPath = File::createTmpName('google_');
			if ($tmpPath === false)
			{
				return Response::invalid('Failed to create temporary file.');
			}

			if (!File::put($tmpPath, $content))
			{
				return Response::invalid('Failed to write temporary image file.');
			}

			// Determine mime type to set correct extension if possible, or default to jpg
			$mime = File::getMimeType($tmpPath);
			$ext = 'jpg'; // Default
			$map = [
				'image/jpeg' => 'jpg',
				'image/png' => 'png',
				'image/gif' => 'gif',
				'image/webp' => 'webp',
			];
			if ($mime && isset($map[$mime]))
			{
				$ext = $map[$mime];
			}

			// Create file data array for UploadFile constructor
			$tmpName = basename($tmpPath);
			$tmpFile = [
				'name' => "{$tmpName}.{$ext}",
				'tmp_name' => $tmpPath,
				'type' => $mime ?: 'application/octet-stream',
				'size' => strlen($content),
				'error' => 0
			];

			// Create UploadFile instance from the downloaded file
			$uploadFile = new UploadFile($tmpFile);

			// Process the upload
			return $this->uploadUserImage($uploadFile, $userId);
		}
		catch (\Exception $e)
		{
			return Response::invalid('Image import failed: ' . $e->getMessage());
		}
	}
}
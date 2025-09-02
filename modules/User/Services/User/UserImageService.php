<?php declare(strict_types=1);
namespace Modules\User\Services\User;

use Modules\User\Models\User;
use Proto\Controllers\Response;
use Proto\Http\UploadFile;

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
			// Generate a unique filename if not provided
			$fileName = $uploadFile->getOriginalName();
			$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
			$storedFileName = 'user_' . $userId . '_' . time() . '.' . $fileExtension;
		}

		return $storedFileName;
	}
}
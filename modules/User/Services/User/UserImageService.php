<?php declare(strict_types=1);
namespace Modules\User\Services\User;

use Modules\User\Models\User;

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
	 * @var array $allowedExtensions
	 */
	private array $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

	/**
	 * @var int $maxFileSize Maximum file size in bytes (30MB)
	 */
	private int $maxFileSize = 30 * 1024 * 1024;

	/**
	 * Validates the uploaded image file.
	 *
	 * @param object|null $uploadFile The uploaded file object.
	 * @return array Returns ['valid' => bool, 'error' => string|null]
	 */
	public function validateImage(?object $uploadFile): array
	{
		if ($uploadFile === null)
		{
			return ['valid' => false, 'error' => 'No image file provided.'];
		}

		/**
		 * Validate file type based on extension.
		 */
		$fileName = $uploadFile->getOriginalName();
		$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
		if (!in_array($fileExtension, $this->allowedExtensions))
		{
			return [
				'valid' => false,
				'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
			];
		}

		$fileSize = $uploadFile->getSize();
        if ($fileSize > $this->maxFileSize)
        {
            $maxSizeMB = $this->maxFileSize / (1024 * 1024);
            return [
                'valid' => false,
                'error' => "File size too large. Maximum size is {$maxSizeMB}MB."
            ];
        }

		return ['valid' => true, 'error' => null];
	}

	/**
	 * Stores the uploaded image file.
	 *
	 * @param object $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return array Returns ['success' => bool, 'path' => string|null, 'filename' => string|null, 'error' => string|null]
	 */
	public function storeImage(object $uploadFile, int $userId): array
	{
		try {
			/**
			 * Store the file using the Vault system.
			 */
			$storedPath = $uploadFile->store('local', 'users');
			if (!$storedPath)
			{
				return [
					'success' => false,
					'path' => null,
					'filename' => null,
					'error' => 'Failed to store the image file.'
				];
			}

			/**
			 * Get the stored filename and generate display filename.
			 */
			$storedFileName = $uploadFile->getNewName();
			$displayFileName = $this->generateFileName($storedFileName, $uploadFile, $userId);

			return [
				'success' => true,
				'path' => $storedFileName, // This is the actual stored filename that can be used to retrieve the file
				'filename' => $displayFileName,
				'error' => null
			];
		}
		catch (\Exception $e)
		{
			return [
				'success' => false,
				'path' => null,
				'filename' => null,
				'error' => 'Failed to store image: ' . $e->getMessage()
			];
		}
	}

	/**
	 * Updates the user's image field in the database.
	 *
	 * @param int $userId The user ID.
	 * @param string $fileName The stored file name.
	 * @return array Returns ['success' => bool, 'error' => string|null]
	 */
	public function updateUserImage(int $userId, string $fileName): array
	{
		try {
			$user = User::get($userId);
			if (!$user)
			{
				return ['success' => false, 'error' => 'User not found.'];
			}

			// Set the image field and update
			$user->image = $fileName;
			$result = $user->update();
			if ($result)
			{
				return ['success' => true, 'error' => null];
			}

            return ['success' => false, 'error' => 'Failed to update user image reference.'];
		}
		catch (\Exception $e)
		{
			return ['success' => false, 'error' => 'Database update failed: ' . $e->getMessage()];
		}
	}

	/**
	 * Uploads and processes a user image (complete workflow).
	 *
	 * @param object|null $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return array Returns ['success' => bool, 'data' => array|null, 'error' => string|null]
	 */
	public function uploadUserImage(?object $uploadFile, int $userId): array
	{
		/**
		 * Step 1: Validate the image.
		 */
		$validation = $this->validateImage($uploadFile);
		if (!$validation['valid'])
		{
			return ['success' => false, 'data' => null, 'error' => $validation['error']];
		}

		/**
		 * Step 2: Store the image.
		 */
		$storage = $this->storeImage($uploadFile, $userId);
		if (!$storage['success'])
		{
			return ['success' => false, 'data' => null, 'error' => $storage['error']];
		}

		/**
		 * Step 3: Update user record.
		 */
		$update = $this->updateUserImage($userId, $storage['filename']);
		if (!$update['success'])
		{
			return ['success' => false, 'data' => null, 'error' => $update['error']];
		}

		/**
		 * Return success with data.
		 */
		return [
			'success' => true,
			'data' => [
				'image' => $storage['filename'],
				'path' => $storage['path'],
				'message' => 'Image uploaded successfully.'
			],
			'error' => null
		];
	}

	/**
	 * Generates a filename for the stored image.
	 *
	 * @param string $storedFileName The stored file name from Vault.
	 * @param object $uploadFile The uploaded file object.
	 * @param int $userId The user ID.
	 * @return string The generated filename.
	 */
	private function generateFileName(string $storedFileName, object $uploadFile, int $userId): string
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

	/**
	 * Gets the allowed file extensions.
	 *
	 * @return array The allowed extensions.
	 */
	public function getAllowedExtensions(): array
	{
		return $this->allowedExtensions;
	}

	/**
	 * Gets the maximum file size in bytes.
	 *
	 * @return int The maximum file size.
	 */
	public function getMaxFileSize(): int
	{
		return $this->maxFileSize;
	}
}
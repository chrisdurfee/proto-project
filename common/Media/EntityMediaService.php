<?php declare(strict_types=1);

namespace Common\Media;

use Common\Media\Traits\MediaImageOptimizationTrait;
use Common\Services\Service;
use Proto\Utils\Files\Vault;

/**
 * EntityMediaService
 *
 * Shared base class for `*MediaService` classes that attach one or more
 * media rows (image/video/document) to a parent entity (post, article,
 * event, etc.) via a `*_media` table. Each concrete service declares the
 * model class + disk folder + foreign-key column it owns and inherits a
 * single upload/delete/resolve implementation.
 *
 * Configuration is captured as overridable hooks so subclasses stay tiny —
 * only the parts that actually differ between entities (folder name, model,
 * FK, default status, uploader column, soft- vs hard-delete) need to be
 * declared.
 *
 * @package Common\Media
 */
abstract class EntityMediaService extends Service
{
	use MediaImageOptimizationTrait;

	/**
	 * Fully-qualified entity-media model class (e.g. PostMedia::class).
	 *
	 * @return class-string
	 */
	abstract protected function modelClass(): string;

	/**
	 * Vault disk subfolder for this entity. Used as both the storage
	 * folder and the optimizer subfolder. Example: `'posts'`.
	 *
	 * @return string
	 */
	abstract protected function diskFolder(): string;

	/**
	 * Foreign-key column on the media row that links it back to the
	 * parent entity. Example: `'postId'`, `'articleId'`, `'eventId'`.
	 *
	 * @return string
	 */
	abstract protected function ownerField(): string;

	/**
	 * Default `status` for newly created media rows.
	 *
	 * @return string
	 */
	protected function defaultStatus(): string
	{
		return 'ready';
	}

	/**
	 * Status for a newly created media row of the given type. Defaults
	 * to {@see defaultStatus()}; services with async post-processing
	 * (e.g. video transcoding) override this per type.
	 *
	 * @param string $type `'image'`, `'video'`, or `'document'`.
	 * @return string
	 */
	protected function statusForType(string $type): string
	{
		return $this->defaultStatus();
	}

	/**
	 * Name of the column storing the uploader's user id. Most tables
	 * use `'userId'`; some denormalize a separate column such as
	 * `'uploadedBy'`.
	 *
	 * @return string
	 */
	protected function uploaderField(): string
	{
		return 'userId';
	}

	/**
	 * Whether the table also stores `userId` alongside the
	 * `uploaderField()` when that field is not itself `userId`.
	 *
	 * @return bool
	 */
	protected function includesUserIdColumn(): bool
	{
		return true;
	}

	/**
	 * Default `sortOrder` for the new row. Return null when the table
	 * has no sort order column.
	 *
	 * @return int|null
	 */
	protected function defaultSortOrder(): ?int
	{
		return 0;
	}

	/**
	 * Whether delete should soft-delete via `deleted_at` (default) or
	 * hard-delete via the model `remove()` static.
	 *
	 * @return bool
	 */
	protected function usesSoftDelete(): bool
	{
		return true;
	}

	/**
	 * Whether to ignore filesystem-deletion failures. When false, any
	 * Vault::delete exception bubbles to the caller.
	 *
	 * @return bool
	 */
	protected function tolerateMissingFile(): bool
	{
		return true;
	}

	/**
	 * Upload a media file and create a media row linked to the parent
	 * entity. Subclasses expose their own public `uploadMedia()`
	 * signature (varies by entity) and delegate to this helper.
	 *
	 * @param int $userId
	 * @param int|null $ownerId Parent entity id (postId, articleId, etc.).
	 *                          Null is allowed when the row is created
	 *                          ahead of the parent (e.g. a composer flow).
	 * @param object $file UploadFile instance
	 * @param string $type `'image'`, `'video'`, or `'document'`
	 * @param array $extra Additional column => value pairs to persist on
	 *                     the media row (e.g. a secondary foreign key).
	 * @return object|false The created row, or false on failure.
	 */
	protected function persistMediaUpload(int $userId, ?int $ownerId, object $file, string $type = 'image', array $extra = []): object|false
	{
		// Capture metadata BEFORE store(): store() moves the tmp file,
		// after which getMimeType()/getDimensions() can no longer read it.
		// Calling getMimeType() here populates UploadFile::$mime so
		// isImageFile() (used inside the optimization trait) keeps returning
		// the cached value.
		$mimeType = $file->getMimeType();
		$isImage = $file->isImageFile();
		$dimensions = ($type === 'image' && $isImage) ? $file->getDimensions() : [0, 0];

		$folder = $this->diskFolder();
		$file->store('local', $folder);
		$filename = $file->getNewName();

		$row = [
			$this->ownerField() => $ownerId,
			'uuid' => $this->generateUuid(),
			'filename' => $filename,
			'originalName' => $file->getOriginalName(),
			'path' => "/files/{$folder}/{$filename}",
			'type' => $type,
			'mimeType' => $mimeType,
			'fileSize' => $file->getSize(),
			'status' => $this->statusForType($type),
		];

		$row[$this->uploaderField()] = $userId;
		if ($this->includesUserIdColumn() && $this->uploaderField() !== 'userId')
		{
			$row['userId'] = $userId;
		}

		$sortOrder = $this->defaultSortOrder();
		if ($sortOrder !== null)
		{
			$row['sortOrder'] = $sortOrder;
		}

		foreach ($extra as $key => $value)
		{
			$row[$key] = $value;
		}

		$class = $this->modelClass();
		/** @var object $media */
		$media = new $class((object)$row);

		if ($type === 'image' && $isImage)
		{
			[$media->width, $media->height] = $dimensions;
		}

		$this->optimizeUploadedImage($media, $file, $folder);

		$media->add();
		return $media->id ? $media : false;
	}

	/**
	 * Delete a media row and its underlying file. Subclasses extend
	 * this to add domain authorization (e.g. moderator/staff bypass)
	 * before calling parent::deleteMedia().
	 *
	 * @param int $mediaId
	 * @param int $userId
	 * @return bool True when the row was removed.
	 */
	public function deleteMedia(int $mediaId, int $userId): bool
	{
		$class = $this->modelClass();
		$media = $class::get($mediaId);
		if (!$media || !$this->canDelete($media, $userId, false))
		{
			return false;
		}

		return $this->removeMedia($media);
	}

	/**
	 * Authorization hook called from {@see deleteMedia()}. Subclasses
	 * override to add moderator/owner/staff bypass.
	 *
	 * @param object $media
	 * @param int $userId
	 * @param bool $bypass Whether the caller passed an override flag
	 *                     (moderator/admin/staff/owner).
	 * @return bool
	 */
	protected function canDelete(object $media, int $userId, bool $bypass): bool
	{
		if ($bypass)
		{
			return true;
		}

		$uploaderId = (int)($media->{$this->uploaderField()} ?? 0);
		return $uploaderId === $userId;
	}

	/**
	 * Remove the underlying file and the media row. Shared between
	 * {@see deleteMedia()} and subclass variants that add extra
	 * authorization parameters.
	 *
	 * @param object $media
	 * @return bool
	 */
	protected function removeMedia(object $media): bool
	{
		$folder = $this->diskFolder();
		try
		{
			Vault::disk('local', $folder)->delete($media->filename);
		}
		catch (\Exception $e)
		{
			if (!$this->tolerateMissingFile())
			{
				throw $e;
			}
		}

		$this->deleteOptimizedImage($media, $folder);

		$class = $this->modelClass();
		if (!$this->usesSoftDelete())
		{
			return (bool)$class::remove((int)$media->id);
		}

		$class::builder()
			->update()
			->set(['deleted_at' => date('Y-m-d H:i:s')])
			->where('id = ?')
			->execute([(int)$media->id]);

		return true;
	}

	/**
	 * Determine the media type from a MIME type string.
	 *
	 * @param string $mimeType
	 * @return string `'image'` | `'video'` | `'document'`
	 */
	public function resolveMediaType(string $mimeType): string
	{
		if (str_starts_with($mimeType, 'image/'))
		{
			return 'image';
		}

		if (str_starts_with($mimeType, 'video/'))
		{
			return 'video';
		}

		return 'document';
	}
}

<?php declare(strict_types=1);
namespace Modules\Messaging\Services;

use Common\Services\Service;
use Modules\Messaging\Models\MessageAttachment;
use Modules\Messaging\Models\Message;
use Proto\Http\Router\Request;
use Proto\Http\UploadFile;

/**
 * MessageAttachmentService
 *
 * This service handles message attachment operations.
 *
 * @package Modules\Messaging\Services
 */
class MessageAttachmentService extends Service
{
	/**
	 * Handle file attachments for a message.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $messageId The message ID.
	 * @return object The response object.
	 */
	public function handleAttachments(Request $request, int $messageId): object
	{
		$attachmentCount = $this->storeAttachments($request, $messageId);

		if ($attachmentCount === 0)
		{
			return $this->response([
				'success' => true,
				'message' => 'No attachments to store'
			]);
		}

		return $this->response([
			'success' => true,
			'message' => "{$attachmentCount} attachment(s) uploaded successfully",
			'count' => $attachmentCount
		]);
	}

	/**
	 * Store multiple file attachments for a message.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $messageId The message ID.
	 * @return int Number of successfully stored attachments.
	 */
	public function storeAttachments(Request $request, int $messageId): int
	{
		$count = 0;

		$uploadFiles = $request->validateFileArray('attachments', [
			'attachments' => 'file:50240|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip'
		]);

		if (empty($uploadFiles))
		{
			return 0;
		}

		foreach ($uploadFiles as $uploadFile)
		{
			try
			{
				if (!$uploadFile->store('local', 'messages'))
				{
					continue;
				}

				$attachmentData = $this->prepareAttachmentData($uploadFile, $messageId);
				if (MessageAttachment::create($attachmentData))
				{
					$count++;
				}
			}
			catch (\Exception $e)
			{
				continue;
			}
		}

		return $count;
	}

	/**
	 * Prepare attachment data for storage.
	 *
	 * @param UploadFile $uploadFile The uploaded file object.
	 * @param int $messageId The ID of the message.
	 * @return object The prepared attachment data.
	 */
	protected function prepareAttachmentData(UploadFile $uploadFile, int $messageId): object
	{
		$attachmentData = [
			'messageId' => $messageId,
			'fileName' => $uploadFile->getOriginalName(),
			'fileUrl' => $uploadFile->getNewName(),
			'fileType' => $uploadFile->getMimeType(),
			'fileSize' => $uploadFile->getSize()
		];

		return (object)$attachmentData;
	}

	/**
	 * Get attachments for a message.
	 *
	 * @param int $messageId The message ID.
	 * @return array Array of attachments.
	 */
	public function getAttachments(int $messageId): array
	{
		return MessageAttachment::fetchWhere(['messageId' => $messageId]) ?? [];
	}

	/**
	 * Delete an attachment.
	 *
	 * @param int $attachmentId The attachment ID.
	 * @return bool Success status.
	 */
	public function deleteAttachment(int $attachmentId): bool
	{
		$attachment = MessageAttachment::get($attachmentId);
		if (!$attachment)
		{
			return false;
		}

		// Delete file from storage
		$basePath = $_SERVER['DOCUMENT_ROOT'] ?? '';
		$filePath = $basePath . "/files/messages/{$attachment->fileUrl}";
		if (file_exists($filePath))
		{
			@unlink($filePath);
		}

		return MessageAttachment::deleteById((object)['id' => $attachmentId]);
	}
}

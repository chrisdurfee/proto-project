<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Services;

use Common\Services\Service;
use Modules\Client\Conversation\Models\ClientConversationAttachment;
use Modules\Client\Conversation\Models\ClientConversation;
use Proto\Http\Router\Request;
use Proto\Http\UploadFile;

/**
 * ConversationAttachmentService
 *
 * This service handles conversation attachment operations.
 *
 * @package Modules\Client\Conversation\Services
 */
class ConversationAttachmentService extends Service
{
	/**
	 * Handle file attachments for a conversation.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $conversationId The conversation ID.
	 * @param int|null $userId The user ID who uploaded the files.
	 * @return object The response object.
	 */
	public function handleAttachments(Request $request, int $conversationId, ?int $userId = null): object
	{
		$attachmentCount = $this->storeAttachments(
			$request,
			$conversationId,
			$userId
		);

		if ($attachmentCount === 0)
		{
			return $this->error('No valid attachments found.');
		}

		return $this->updateAttachmentCount($conversationId, $attachmentCount);
	}

	/**
	 * Store multiple file attachments for a conversation.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $conversationId The conversation ID.
	 * @param int|null $userId The user ID who uploaded the files.
	 * @return int Number of successfully stored attachments.
	 */
	public function storeAttachments(Request $request, int $conversationId, ?int $userId = null): int
	{
		$count = 0;

		$uploadFiles = $request->validateFileArray('attachments', [
			'attachments' => 'file:50240|required|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip'
		]);

		if (empty($uploadFiles))
		{
			return 0;
		}

		foreach ($uploadFiles as $uploadFile)
		{
			try
			{
				if (!$uploadFile->store('local', 'conversation'))
				{
					continue;
				}

				$attachmentData = $this->prepareAttachmentData($uploadFile, $conversationId, $userId);
				if (ClientConversationAttachment::create($attachmentData))
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
	 * Update the attachment count for a conversation.
	 *
	 * @param int $conversationId The ID of the conversation.
	 * @param int $count The new attachment count.
	 * @return object The response object.
	 */
	public function updateAttachmentCount(int $conversationId, int $count): object
	{
		$result = ClientConversation::edit((object)[
            'id' => $conversationId,
            'attachmentCount' => $count
        ]);

		return $this->response($result);
	}

	/**
	 * Prepare attachment data for storage.
	 *
	 * @param UploadFile $uploadFile The uploaded file object.
	 * @param int $conversationId The ID of the conversation.
	 * @param int|null $userId The ID of the user uploading the file.
	 * @return object The prepared attachment data.
	 */
	protected function prepareAttachmentData(UploadFile $uploadFile, int $conversationId, ?int $userId = null): object
	{
		$attachmentData = [
			'conversationId' => $conversationId,
			'uploadedBy' => $userId,
			'fileName' => $uploadFile->getOriginalName(),
			'filePath' => $uploadFile->getNewName(),
			'fileType' => $uploadFile->getMimeType(),
			'fileExtension' => strtolower(pathinfo($uploadFile->getOriginalName(), PATHINFO_EXTENSION)),
			'fileSize' => $uploadFile->getSize(),
			'displayName' => $uploadFile->getOriginalName()
		];

		// If it's an image, get dimensions
		if ($uploadFile->isImageFile())
		{
			[$width, $height] = $uploadFile->getDimensions();
			if ($width > 0 && $height > 0)
			{
				$attachmentData['width'] = $width;
				$attachmentData['height'] = $height;
			}
		}

		return (object)$attachmentData;
	}
}

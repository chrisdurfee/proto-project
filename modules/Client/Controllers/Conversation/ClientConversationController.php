<?php declare(strict_types=1);
namespace Modules\Client\Controllers\Conversation;

use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Client\Models\Conversation\ClientConversation;
use Modules\Client\Models\Conversation\ClientConversationAttachment;
use Proto\Http\UploadFile;

/**
 * ClientConversationController
 *
 * @package Modules\Client\Controllers\Conversation
 */
class ClientConversationController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = ClientConversation::class
	)
	{
		parent::__construct();
	}

	/**
	 * This will set up the validation rules.
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'clientId' => 'int|required',
			'userId' => 'int|required',
			'message' => 'string:5000|required',
			'isInternal' => 'int',
			'isPinned' => 'int',
			'messageType' => 'string:50',
			'parentId' => 'int'
		];
	}

	/**
	 * Override the add method to handle file attachments.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation and attachments.
	 */
	public function add(Request $request): object
	{
		$result = parent::add($request);
		if ($result->success === false)
		{
			return $result;
		}

		// Check if files were uploaded
		if (empty($_FILES['attachments']) || empty($_FILES['attachments']['name']))
		{
			return $result;
		}

		return $this->handleAttachments($request, $result->id);
	}

	/**
	 * Handle file attachments for a conversation.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $conversationId The conversation ID.
	 * @return object The response object.
	 */
	private function handleAttachments(Request $request, int $conversationId): object
	{
		$userId = getSession('user')->id ?? null;
		$attachmentCount = $this->storeAttachments(
			$request,
			$conversationId,
			$userId
		);

		if ($attachmentCount === 0)
		{
			return $this->error('No valid attachments found', 400);
		}

		return $this->updateAttachmentCount($conversationId, $attachmentCount);
	}

	/**
	 * Update the attachment count for a conversation.
	 *
	 * @param int $conversationId The ID of the conversation.
	 * @param int $count The new attachment count.
	 * @return object The response object.
	 */
	protected function updateAttachmentCount(int $conversationId, int $count): object
	{
		$conversation = ClientConversation::get($conversationId);
		if (!$conversation)
		{
			return $this->error('Conversation not found', 404);
		}

		$conversation->attachmentCount = $count;
		$result = $conversation->update();

		return $this->response($result);
	}

	/**
	 * Store multiple file attachments for a conversation.
	 *
	 * @param Request $request The HTTP request object.
	 * @param int $conversationId The conversation ID.
	 * @param int $userId The user ID who uploaded the files.
	 * @return int Number of successfully stored attachments.
	 */
	private function storeAttachments(Request $request, int $conversationId, int $userId): int
	{
		$count = 0;

		// Get and validate uploaded files using the new method
		$uploadFiles = $request->validateFileArray('attachments', [
			'attachments' => 'file:50240|required|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip'
		]);

		if (empty($uploadFiles))
		{
			return 0;
		}

		// Process each validated file
		foreach ($uploadFiles as $uploadFile)
		{
			try
			{
				// Store the file
				if (!$uploadFile->store('local', 'conversation'))
				{
					continue;
				}

				// Prepare attachment data
				$attachmentData = $this->setupAttachmentData($uploadFile, $conversationId, $userId);

				// Create attachment record
				if (ClientConversationAttachment::create((object)$attachmentData))
				{
					$count++;
				}
			}
			catch (\Exception $e)
			{
				// Log error but continue with other files
				continue;
			}
		}

		return $count;
	}

	/**
	 * Prepare attachment data for storage.
	 *
	 * @param UploadFile $uploadFile The uploaded file object.
	 * @param int $conversationId The ID of the conversation.
	 * @param int $userId The ID of the user uploading the file.
	 * @return array The prepared attachment data.
	 */
	protected function setupAttachmentData(UploadFile $uploadFile, int $conversationId, int $userId): array
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

		return $attachmentData;
	}
}
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
	public function __construct(protected ?string $model = ClientConversation::class)
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

		$files = $request->files();
		if (empty($files['attachments']))
		{
			return $result;
		}

		$userId = getSession('user')->id ?? null;
		if ($userId === null)
		{
			return $this->error('User not authenticated.');
		}

		$attachmentCount = $this->storeAttachments(
			$request,
			$result->id,
			(int)$userId
		);

		// Update attachment count if files were uploaded
		if ($attachmentCount > 0)
		{
			$conversation = ClientConversation::get($result->id);
			if ($conversation)
			{
				$conversation->attachmentCount = $attachmentCount;
				$conversation->update();
			}
		}

		return $result;
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
		
		// Get raw $_FILES data for attachments
		$rawFiles = $_FILES['attachments'] ?? null;
		if (!$rawFiles || empty($rawFiles['name']))
		{
			return 0;
		}

		// Handle single file vs multiple files
		$fileCount = is_array($rawFiles['name']) ? count($rawFiles['name']) : 1;

		for ($i = 0; $i < $fileCount; $i++)
		{
			try
			{
				// Extract file data
				$fileName = is_array($rawFiles['name']) ? $rawFiles['name'][$i] : $rawFiles['name'];
				$fileTmpName = is_array($rawFiles['tmp_name']) ? $rawFiles['tmp_name'][$i] : $rawFiles['tmp_name'];
				$fileSize = is_array($rawFiles['size']) ? $rawFiles['size'][$i] : $rawFiles['size'];
				$fileError = is_array($rawFiles['error']) ? $rawFiles['error'][$i] : $rawFiles['error'];
				$fileType = is_array($rawFiles['type']) ? $rawFiles['type'][$i] : $rawFiles['type'];

				// Skip if error
				if ($fileError !== UPLOAD_ERR_OK)
				{
					continue;
				}

				// Create UploadFile instance
				$uploadFile = new UploadFile([
					'name' => $fileName,
					'tmp_name' => $fileTmpName,
					'size' => $fileSize,
					'error' => $fileError,
					'type' => $fileType
				]);

				// Validate file
				$this->validateRules(['file' => $uploadFile], [
					'file' => 'file:50240|required|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip'
				]);

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
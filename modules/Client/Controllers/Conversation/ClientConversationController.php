<?php declare(strict_types=1);
namespace Modules\Client\Controllers\Conversation;

use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Client\Models\Conversation\ClientConversation;
use Modules\Client\Models\Conversation\ClientConversationAttachment;

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
			$files['attachments'],
			$result->id,
			(int)$userId
		);

		// Update attachment count if files were uploaded
		if ($attachmentCount > 0)
		{
			$result->attachmentCount = $attachmentCount;
			$result->update();
		}

		return $result;
	}

	/**
	 * Store multiple file attachments for a conversation.
	 *
	 * @param array $files Array of uploaded files.
	 * @param int $conversationId The conversation ID.
	 * @param int $userId The user ID who uploaded the files.
	 * @return int Number of successfully stored attachments.
	 */
	private function storeAttachments(array $files, int $conversationId, int $userId): int
	{
		$count = 0;

		foreach ($files as $uploadFile)
		{
			try
			{
				$this->validateRules(['file' => $uploadFile], [
					'file' => 'file:10240|required|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip'
				]);

				// Store the file
				if (!$uploadFile->store('local', 'attachments'))
				{
					continue;
				}

				// Prepare attachment data
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
				if (str_starts_with($uploadFile->getMimeType(), 'image/'))
				{
					$tmpPath = $uploadFile->getTempPath();
					if ($tmpPath && file_exists($tmpPath))
					{
						$imageInfo = @getimagesize($tmpPath);
						if ($imageInfo)
						{
							$attachmentData['width'] = $imageInfo[0];
							$attachmentData['height'] = $imageInfo[1];
						}
					}
				}

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
	 * Store multiple file attachments for a conversation.
	 *
	 * @param array $files Array of uploaded files.
	 * @param int $conversationId The conversation ID.
	 * @param int $userId The user ID who uploaded the files.
	 * @return int Number of successfully stored attachments.
	 */
	private function storeAttachments(array $files, int $conversationId, int $userId): int
	{
		$count = 0;

		foreach ($files as $uploadFile)
		{
			try
			{
				// Validate file using the validation system
				$this->validateRules(['file' => $uploadFile], [
					'file' => 'file:10240|required|mimes:pdf,doc,docx,xls,xlsx,txt,csv,jpg,jpeg,png,gif,webp,zip' // 10MB max
				]);

				// Store the file
				$storedPath = $uploadFile->store('local', 'attachments');
				if (!$storedPath)
				{
					continue;
				}

				// Get file information
				$fileName = $uploadFile->getOriginalName();
				$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
				$fileType = $uploadFile->getMimeType();
				$fileSize = $uploadFile->getSize();

				// Prepare attachment data
				$attachmentData = [
					'conversationId' => $conversationId,
					'uploadedBy' => $userId,
					'fileName' => $fileName,
					'filePath' => $uploadFile->getNewName(),
					'fileType' => $fileType,
					'fileExtension' => $fileExtension,
					'fileSize' => $fileSize,
					'displayName' => $fileName
				];

				// If it's an image, get dimensions
				if (str_starts_with($fileType, 'image/'))
				{
					$tmpPath = $uploadFile->getTempPath();
					if ($tmpPath && file_exists($tmpPath))
					{
						$imageInfo = @getimagesize($tmpPath);
						if ($imageInfo)
						{
							$attachmentData['width'] = $imageInfo[0];
							$attachmentData['height'] = $imageInfo[1];
						}
					}
				}

				// Store attachment record
				$attachment = ClientConversationAttachment::create((object)$attachmentData);
				if ($attachment)
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
}
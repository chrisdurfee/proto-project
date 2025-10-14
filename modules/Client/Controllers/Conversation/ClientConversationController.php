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

	public function add(Request $request): object
	{
		$result = parent::add($request);
		if ($result->success === false)
		{
			return $result;
		}

		// store attachments
		$attachmentResult = $this->uploadAttachments($request, $result->id);
	}

	/**
	 * Upload attachments for a conversation.
	 *
	 * @param Request $request
	 * @param int $conversationId
	 * @return int
	 */
	protected function uploadAttachments(Request $request, int $conversationId): int
	{
		$files = $request->files();
		$attachmentCount = 0;

		if (!empty($files['attachments']))
		{
			$attachmentCount = $this->storeAttachments($files['attachments'], $conversationId, (int)$data['userId']);
		}

		// Update attachment count if files were uploaded
		if ($attachmentCount > 0)
		{
			$conversation->attachmentCount = $attachmentCount;
			$conversation->update();
		}

		return $attachmentCount;
	}

	/**
	 * Override the create method to handle file attachments.
	 *
	 * @param Request $request The HTTP request object.
	 * @return object Response with created conversation and attachments.
	 */
	public function create(Request $request): object
	{
		// Get the request data
		$data = $this->getRequestItem($request);

		// Validate the conversation data
		$this->validateRules($data, [
			'clientId' => 'int|required',
			'userId' => 'int|required',
			'message' => 'string:5000|required',
			'isInternal' => 'int',
			'isPinned' => 'int',
			'messageType' => 'string:50',
			'parentId' => 'int'
		]);

		// Create the conversation
		$conversation = ClientConversation::create((object)$data);
		if (!$conversation || !is_object($conversation))
		{
			return $this->error('Failed to create conversation.');
		}

		// Handle file attachments if present
		$files = $request->files();
		$attachmentCount = 0;

		if (!empty($files['attachments']))
		{
			$attachmentCount = $this->storeAttachments($files['attachments'], $conversation->id, (int)$data['userId']);
		}

		// Update attachment count if files were uploaded
		if ($attachmentCount > 0)
		{
			$conversation->attachmentCount = $attachmentCount;
			$conversation->update();
		}

		return $this->response($conversation);
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
<?php declare(strict_types=1);
namespace Modules\Client\Controllers\Conversation;

use Proto\Controllers\ResourceController as Controller;
use Proto\Http\Router\Request;
use Modules\Client\Models\Conversation\ClientConversation;
use Modules\Client\Services\Conversation\ConversationAttachmentService;
use Modules\Client\Auth\Policies\ClientResourcePolicy;

/**
 * ClientConversationController
 *
 * @package Modules\Client\Controllers\Conversation
 */
class ClientConversationController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 * @param ConversationAttachmentService $service The attachment service.
	 */
	public function __construct(
		protected ?string $model = ClientConversation::class,
		protected ConversationAttachmentService $service = new ConversationAttachmentService()
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

		$userId = getSession('user')->id ?? null;
		return $this->service->handleAttachments($request, $result->id, $userId);
	}

	/**
	 * Modifies the filter object based on the request.
	 *
	 * @param mixed $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		if ($request->params()->clientId)
		{
			$filter->clientId = $request->params()->clientId;
		}

		return $filter;
	}
}
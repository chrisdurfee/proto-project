<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;
use Modules\Messaging\Models\Conversation;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * ConversationController
 *
 * @package Modules\Messaging\Controllers
 */
class ConversationController extends ResourceController
{
	/**
	 * Constructor
     *
     * @param string|null $model
	 */
	public function __construct(
		protected ?string $model = Conversation::class
	)
    {
		parent::__construct();
	}

	/**
	 * Get conversations for the current user.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function index(Request $request): object
	{
		$userId = getSession('user')->id ?? null;
        if (!$userId)
        {
            return $this->error('Unauthorized', 401);
        }

		$conversations = Conversation::getForUser($userId);
		return $this->response($conversations);
	}

	/**
	 * Get a specific conversation.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function show(Request $request): object
	{
		$conversationId = (int)$this->getResourceId($request);
		$conversation = Conversation::get($conversationId);
		if (!$conversation)
        {
			return $this->error('Conversation not found', 404);
		}

		return $this->response($conversation);
	}

	/**
	 * Create a new conversation.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function store(Request $request): object
	{
		$userId = getSession('user')->id ?? null;
        if (!$userId)
        {
            return $this->error('Unauthorized', 401);
        }

		$data = $this->getRequestItem($request);
		if (empty($data))
        {
			return $this->error('No data provided', 400);
		}

		// Set created_by
		$data->createdBy = $userId;
		$data->type = $data->type ?? 'direct';

		// Create conversation
		$conversation = Conversation::create((object)$data);
		if (!$conversation)
        {
			return $this->error('Failed to create conversation');
		}

		return $this->response($conversation);
	}

	/**
	 * Validation rules
	 */
	protected function validate(): array
	{
		return [
			'title' => 'string:255',
			'type' => 'string:20',
			'description' => 'string:500'
		];
	}
}
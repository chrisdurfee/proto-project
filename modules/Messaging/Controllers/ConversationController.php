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
	 * Create a new conversation and add participant.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function add(Request $request): object
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

		// Set createdBy
		$data->createdBy = $userId;

		// Use parent add method for creation
		$result = $this->addItem($data);

		if ($result->success && isset($data->participantId))
		{
			// Add participant
			ConversationParticipant::create((object)[
				'conversationId' => $result->data->id,
				'userId' => $data->participantId,
				'isActive' => 1
			]);

			// Add creator as participant
			ConversationParticipant::create((object)[
				'conversationId' => $result->data->id,
				'userId' => $userId,
				'isActive' => 1
			]);
		}

		return $result;
	}

	/**
	 * Validation rules
	 */
	protected function validate(): array
	{
		return [
			'title' => 'string:255',
			'type' => 'string:20',
			'description' => 'string:500',
			'participantId' => 'int'
		];
	}
}
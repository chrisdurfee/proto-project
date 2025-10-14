<?php declare(strict_types=1);
namespace Modules\Client\Controllers\Conversation;

use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\Conversation\ClientConversation;

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
}
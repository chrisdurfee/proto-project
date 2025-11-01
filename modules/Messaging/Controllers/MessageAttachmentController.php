<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Messaging\Models\MessageAttachment;

/**
 * MessageAttachmentController
 *
 * @package Modules\Messaging\Controllers
 */
class MessageAttachmentController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = MessageAttachment::class)
	{
		parent::__construct();
	}
}
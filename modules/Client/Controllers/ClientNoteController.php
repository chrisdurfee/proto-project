<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Models\ClientNote;
use Proto\Controllers\ResourceController;

/**
 * ClientNoteController
 *
 * @package Modules\Client\Controllers
 */
class ClientNoteController extends ResourceController
{
	/**
	 * ClientNoteController constructor.
	 */
	public function __construct(
		protected ?string $model = ClientNote::class,
		protected ?string $policy = null
	)
	{
		parent::__construct();
	}
}

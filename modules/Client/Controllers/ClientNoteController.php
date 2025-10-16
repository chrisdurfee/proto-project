<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientResourcePolicy;
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
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientResourcePolicy::class;

	/**
	 * ClientNoteController constructor.
	 */
	public function __construct(
		protected ?string $model = ClientNote::class
	)
	{
		parent::__construct();
	}
}

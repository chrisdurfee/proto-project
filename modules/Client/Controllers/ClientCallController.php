<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Modules\Client\Auth\Policies\ClientCallPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\ClientCall;

/**
 * ClientCallController
 *
 * @package Modules\Client\Controllers
 */
class ClientCallController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientCallPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = ClientCall::class)
	{
		parent::__construct();
	}
}

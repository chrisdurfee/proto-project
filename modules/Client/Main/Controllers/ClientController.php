<?php declare(strict_types=1);
namespace Modules\Client\Main\Controllers;

use Modules\Client\Main\Auth\Policies\ClientPolicy;
use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Main\Models\Client;

/**
 * ClientController
 *
 * @package Modules\Client\Main\Controllers
 */
class ClientController extends Controller
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = ClientPolicy::class;

	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = Client::class)
	{
		parent::__construct();
	}
}

<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\Client;

/**
 * ClientController
 *
 * @package Modules\Client\Controllers
 */
class ClientController extends Controller
{
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
<?php declare(strict_types=1);
namespace Modules\Client\Controllers;

use Proto\Controllers\ResourceController as Controller;
use Modules\Client\Models\ClientContact;

/**
 * ClientContactController
 *
 * @package Modules\Client\Controllers
 */
class ClientContactController extends Controller
{
	/**
	 * Initializes the model class.
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(protected ?string $model = ClientContact::class)
	{
		parent::__construct();
	}
}
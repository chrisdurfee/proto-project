<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Controllers;

use Proto\Controllers\ApiController;
use Proto\Http\Router\Request;
use Modules\Tracking\MediaShare\Auth\Policies\MediaSharePolicy;
use Modules\Tracking\MediaShare\Services\MediaShareService;

/**
 * MediaShareController
 *
 * Handles media share tracking requests.
 *
 * @package Modules\Tracking\MediaShare\Controllers
 */
class MediaShareController extends ApiController
{
	/**
	 * @var string|null $policy the policy class
	 */
	protected ?string $policy = MediaSharePolicy::class;

	/**
	 * @var MediaShareService $service
	 */
	protected MediaShareService $service;

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->service = new MediaShareService();
	}

	/**
	 * Record a media share.
	 *
	 * @param Request $request
	 * @return object
	 */
	public function share(Request $request): object
	{
		$mediaId = $request->getInt('mediaId');
		$mediaType = $request->input('mediaType');
		$shareType = $request->input('shareType') ?: 'external';

		if (!$mediaId || !$mediaType)
		{
			return $this->error('mediaId and mediaType are required');
		}

		$allowedMediaTypes = ['vehicle', 'group'];
		if (!in_array($mediaType, $allowedMediaTypes, true))
		{
			return $this->error('Invalid media type');
		}

		$allowedShareTypes = ['external', 'copy_link'];
		if (!in_array($shareType, $allowedShareTypes, true))
		{
			return $this->error('Invalid share type');
		}

		$userId = session()->user->id;

		$result = $this->service->share($userId, $mediaId, $mediaType, $shareType);
		if (!$result)
		{
			return $this->error('Failed to record share');
		}

		return $this->response($result);
	}
}

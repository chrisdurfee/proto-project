<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Auth\Policies;

use Common\Auth\Policies\Policy;
use Proto\Http\Router\Request;

/**
 * MediaSharePolicy
 *
 * Authorization policy for media share tracking.
 *
 * @package Modules\Tracking\MediaShare\Auth\Policies
 */
class MediaSharePolicy extends Policy
{
	/**
	 * @var string|null $type the policy type
	 */
	protected ?string $type = 'mediaShare';

	/**
	 * Allow sharing if the user is signed in.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function share(Request $request): bool
	{
		return $this->isSignedIn();
	}
}

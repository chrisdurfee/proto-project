<?php declare(strict_types=1);
namespace Modules\Support\Auth\Policies;

use Common\Auth\Policies\Policy;
use Modules\Support\Models\SupportMessage;
use Proto\Http\Router\Request;

/**
 * SupportMessagePolicy
 *
 * Anyone may submit a message, including signed-out visitors sending a
 * contact request from the marketing site. Reading and managing tickets
 * is restricted: a signed-in user sees only their own, while support
 * staff and admins see everything.
 *
 * @package Modules\Support\Auth\Policies
 */
class SupportMessagePolicy extends Policy
{
	/**
	 * @var string|null $type
	 */
	protected ?string $type = 'supportMessage';

	/**
	 * Whether the acting user may triage other people's tickets.
	 *
	 * @return bool
	 */
	protected function isSupportStaff(): bool
	{
		return $this->isAdmin() || $this->hasPermission('support.access');
	}

	/**
	 * Submitting is open so the public contact form works.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		return true;
	}

	/**
	 * Listing is scoped to the acting user by the controller, so a
	 * signed-in user only ever receives their own tickets here.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function all(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		return $this->ownsMessage($request);
	}

	/**
	 * Only staff may change status; a submitter cannot edit a filed report.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		return $this->isSupportStaff();
	}

	/**
	 * @param Request $request
	 * @return bool
	 */
	public function delete(Request $request): bool
	{
		return $this->isSupportStaff();
	}

	/**
	 * Checks that the acting user submitted the requested message.
	 *
	 * @param Request $request
	 * @return bool
	 */
	protected function ownsMessage(Request $request): bool
	{
		if ($this->isSupportStaff())
		{
			return true;
		}

		if (!$this->isSignedIn())
		{
			return false;
		}

		$id = $request->params()->id ?? null;
		if (!$id)
		{
			return false;
		}

		$row = SupportMessage::get((int)$id);
		if (!$row)
		{
			return false;
		}

		return $this->ownsResource($row->userId ?? null);
	}
}

<?php declare(strict_types=1);
namespace Modules\Assistant\Auth\Policies;

use Common\Auth\Policies\Policy;
use Modules\Assistant\Models\AssistantMessag;

/**
 * AssistantMessagePolicy
 *
 * @package Modules\Assistant\Auth\Policies
 */
class AssistantMessagePolicy extends Policy
{
	/**
	 * Default policy for all actions.
	 *
	 * @return bool
	 */
	public function default(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for getting a message.
	 *
	 * @param int $messageId
	 * @return bool
	 */
	public function get(int $messageId): bool
	{
		if (!$this->user()->isAuthenticated())
		{
			return false;
		}

		$message = AssistantMessage::get($messageId);
		if (!$message)
		{
			return false;
		}

		return (int)$message->userId === (int)$this->user()->id();
	}

	/**
	 * Policy for listing messages.
	 *
	 * @return bool
	 */
	public function list(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for creating a message.
	 *
	 * @return bool
	 */
	public function add(): bool
	{
		return $this->user()->isAuthenticated();
	}

	/**
	 * Policy for syncing messages.
	 *
	 * @return bool
	 */
	public function sync(): bool
	{
		return $this->user()->isAuthenticated();
	}
}

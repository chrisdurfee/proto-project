<?php declare(strict_types=1);
namespace Modules\Assistant\Auth\Policies;

use Proto\Auth\Policies\Policy;
use Proto\Http\Router\Request;
use Modules\Assistant\Models\AssistantConversation;

/**
 * AssistantPolicy
 *
 * Abstract base policy for assistant-related authorization.
 * Provides shared methods for conversation ownership and user validation.
 *
 * @package Modules\Assistant\Auth\Policies
 */
abstract class AssistantPolicy extends Policy
{
	/**
	 * Get the current authenticated user ID.
	 *
	 * @return int|null
	 */
	protected function getUserId(): ?int
	{
		return session()->user->id ?? null;
	}

	/**
	 * Check if the user owns the conversation.
	 *
	 * @param int $conversationId
	 * @return bool
	 */
	protected function ownsConversation(int $conversationId): bool
	{
		$userId = $this->getUserId();
		if (!$userId)
		{
			return false;
		}

		$conversation = AssistantConversation::get($conversationId);
		if (!$conversation)
		{
			return false;
		}

		return (int)$conversation->userId === $userId;
	}
}

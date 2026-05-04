<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Conversation\Models\ClientConversation;

/**
 * ClientConversationFactory
 *
 * @package Modules\Client\Conversation\Models\Factories
 */
class ClientConversationFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ClientConversation::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'clientId' => 1,
			'userId' => 1,
			'message' => $this->faker()->paragraph(),
			'isInternal' => 0,
			'isPinned' => 0,
			'isEdited' => 0,
			'messageType' => 'message',
			'attachmentCount' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create an internal note.
	 *
	 * @return static
	 */
	public function internal(): static
	{
		return $this->state(fn() => ['isInternal' => 1]);
	}

	/**
	 * Create a pinned message.
	 *
	 * @return static
	 */
	public function pinned(): static
	{
		return $this->state(fn() => ['isPinned' => 1]);
	}

	/**
	 * Create a reply.
	 *
	 * @return static
	 */
	public function reply(int $parentId = 1): static
	{
		return $this->state(fn() => ['parentId' => $parentId]);
	}
}

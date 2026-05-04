<?php declare(strict_types=1);
namespace Modules\Messaging\Models\Factories;

use Proto\Models\Factory;
use Modules\Messaging\Models\Message;

/**
 * MessageFactory
 *
 * @package Modules\Messaging\Models\Factories
 */
class MessageFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Message::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'conversationId' => 1,
			'senderId' => 1,
			'type' => 'text',
			'content' => $this->faker()->paragraph(),
			'isEdited' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create an image message.
	 *
	 * @return static
	 */
	public function image(): static
	{
		return $this->state(fn() => ['type' => 'image']);
	}

	/**
	 * Create a system message.
	 *
	 * @return static
	 */
	public function system(): static
	{
		return $this->state(fn() => ['type' => 'system']);
	}

	/**
	 * Create a reply message.
	 *
	 * @return static
	 */
	public function reply(int $parentId = 1): static
	{
		return $this->state(fn() => ['parentId' => $parentId]);
	}
}

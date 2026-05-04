<?php declare(strict_types=1);
namespace Modules\Messaging\Models\Factories;

use Proto\Models\Factory;
use Modules\Messaging\Models\Conversation;

/**
 * ConversationFactory
 *
 * @package Modules\Messaging\Models\Factories
 */
class ConversationFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return Conversation::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'title' => $this->faker()->sentence(3),
			'type' => 'direct',
			'createdBy' => 1,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a group conversation.
	 *
	 * @return static
	 */
	public function group(): static
	{
		return $this->state(fn() => [
			'type' => 'group',
			'title' => $this->faker()->sentence(3),
			'description' => $this->faker()->paragraph(),
		]);
	}
}

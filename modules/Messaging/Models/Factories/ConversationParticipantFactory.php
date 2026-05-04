<?php declare(strict_types=1);
namespace Modules\Messaging\Models\Factories;

use Proto\Models\Factory;
use Modules\Messaging\Models\ConversationParticipant;

/**
 * ConversationParticipantFactory
 *
 * @package Modules\Messaging\Models\Factories
 */
class ConversationParticipantFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ConversationParticipant::class;
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
			'userId' => 1,
			'role' => 'member',
			'joinedAt' => date('Y-m-d H:i:s'),
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create an admin participant.
	 *
	 * @return static
	 */
	public function admin(): static
	{
		return $this->state(fn() => ['role' => 'admin']);
	}
}

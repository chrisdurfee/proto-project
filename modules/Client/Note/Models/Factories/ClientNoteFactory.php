<?php declare(strict_types=1);
namespace Modules\Client\Note\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Note\Models\ClientNote;

/**
 * ClientNoteFactory
 *
 * @package Modules\Client\Note\Models\Factories
 */
class ClientNoteFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ClientNote::class;
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
			'title' => $this->faker()->sentence(4),
			'content' => $this->faker()->paragraph(),
			'noteType' => $this->faker()->randomElement(['general', 'meeting', 'call', 'email', 'task', 'follow_up', 'complaint', 'feedback']),
			'priority' => 'medium',
			'visibility' => 'team',
			'status' => 'active',
			'isPinned' => 0,
			'isEdited' => 0,
			'attachmentCount' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create a high-priority note.
	 *
	 * @return static
	 */
	public function highPriority(): static
	{
		return $this->state(fn() => ['priority' => 'high']);
	}

	/**
	 * Create a private note.
	 *
	 * @return static
	 */
	public function privateNote(): static
	{
		return $this->state(fn() => ['visibility' => 'private']);
	}

	/**
	 * Create a pinned note.
	 *
	 * @return static
	 */
	public function pinned(): static
	{
		return $this->state(fn() => ['isPinned' => 1]);
	}
}

<?php declare(strict_types=1);

namespace Modules\Notification\Models\Factories;

use Proto\Models\Factory;
use Modules\Notification\Models\UserNotification;

/**
 * UserNotificationFactory
 *
 * Generates test data for UserNotification models.
 *
 * @package Modules\Notification\Models\Factories
 */
class UserNotificationFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return UserNotification::class;
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'userId' => 1,
			'type' => $this->faker()->randomElement(['garage', 'offers_users', 'offers_partners', 'market', 'upcoming', 'social', 'updates']),
			'category' => $this->faker()->randomElement(['maintenance', 'offers', 'social', 'market', 'events', 'updates', 'partners']),
			'priority' => $this->faker()->randomElement(['high', 'medium', 'low']),
			'title' => $this->faker()->sentence(),
			'description' => $this->faker()->paragraph(),
			'iconName' => $this->faker()->randomElement(['build', 'favorite', 'event', 'trending_down', 'info', 'swap_horiz', 'bookmark']),
			'primaryAction' => $this->faker()->boolean(60) ? $this->faker()->randomElement(['View', 'Book Now', 'View Offer', 'See Details']) : null,
			'secondaryAction' => $this->faker()->boolean(40) ? $this->faker()->randomElement(['Dismiss', 'Snooze', 'Ignore']) : null,
			'statusBadge' => null,
			'metadata' => null,
			'refId' => null,
			'refType' => null,
			'isRead' => 0
		];
	}

	/**
	 * State for a read notification.
	 *
	 * @return static
	 */
	public function read(): static
	{
		return $this->state(fn() => [
			'isRead' => 1,
			'readAt' => date('Y-m-d H:i:s')
		]);
	}

	/**
	 * State for a high-priority notification.
	 *
	 * @return static
	 */
	public function highPriority(): static
	{
		return $this->state(fn() => [
			'priority' => 'high'
		]);
	}

	/**
	 * State for a notification with a status badge.
	 *
	 * @return static
	 */
	public function withBadge(): static
	{
		return $this->state(fn() => [
			'statusBadge' => ['icon' => 'bookmark', 'label' => 'Saved']
		]);
	}

	/**
	 * State for a social notification.
	 *
	 * @return static
	 */
	public function social(): static
	{
		return $this->state(fn() => [
			'type' => 'social',
			'category' => 'social',
			'iconName' => 'favorite'
		]);
	}
}

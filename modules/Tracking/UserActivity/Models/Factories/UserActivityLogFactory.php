<?php declare(strict_types=1);
namespace Modules\Tracking\UserActivity\Models\Factories;

use Proto\Models\Factory;
use Modules\Tracking\UserActivity\Models\UserActivityLog;

/**
 * UserActivityLogFactory
 *
 * @package Modules\Tracking\UserActivity\Models\Factories
 */
class UserActivityLogFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return UserActivityLog::class;
	}

	/**
	 * Define the default attribute set for a UserActivityLog.
	 *
	 * @return array
	 */
	public function definition(): array
	{
		$actions = ['event_joined', 'group_joined', 'service_logged', 'vehicle_added', 'post_created', 'user_followed', 'marketplace_replied'];
		$refTypes = ['event', 'group', 'service_log', 'vehicle', 'post', 'user', 'marketplace_comment'];

		return [
			'userId' => 1,
			'action' => $this->faker()->randomElement($actions),
			'title' => $this->faker()->sentence(4),
			'description' => $this->faker()->sentence(5),
			'refId' => $this->faker()->numberBetween(1, 100),
			'refType' => $this->faker()->randomElement($refTypes),
		];
	}
}

<?php declare(strict_types=1);

namespace Modules\Tracking\MediaShare\Models\Factories;

use Proto\Models\Factory;
use Modules\Tracking\MediaShare\Models\MediaShare;

/**
 * MediaShareFactory
 *
 * Factory for creating test MediaShare instances
 */
class MediaShareFactory extends Factory
{
	/**
	 * Get the model class name
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return MediaShare::class;
	}

	/**
	 * Define the default model attributes
	 *
	 * @return array
	 */
	public function definition(): array
	{
		return [
			'userId' => $this->faker()->numberBetween(1, 100),
			'mediaId' => $this->faker()->numberBetween(1, 100),
			'mediaType' => $this->faker()->randomElement(['vehicle', 'group']),
			'shareType' => $this->faker()->randomElement(['external', 'copy_link']),
		];
	}
}

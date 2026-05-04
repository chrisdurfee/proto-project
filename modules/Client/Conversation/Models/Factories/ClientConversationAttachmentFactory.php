<?php declare(strict_types=1);
namespace Modules\Client\Conversation\Models\Factories;

use Proto\Models\Factory;
use Modules\Client\Conversation\Models\ClientConversationAttachment;

/**
 * ClientConversationAttachmentFactory
 *
 * @package Modules\Client\Conversation\Models\Factories
 */
class ClientConversationAttachmentFactory extends Factory
{
	/**
	 * Get the model class name.
	 *
	 * @return string
	 */
	protected function model(): string
	{
		return ClientConversationAttachment::class;
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
			'uploadedBy' => 1,
			'fileName' => $this->faker()->uuid() . '.pdf',
			'filePath' => 'client/attachments/',
			'fileType' => 'application/pdf',
			'fileExtension' => 'pdf',
			'fileSize' => $this->faker()->numberBetween(1000, 10000000),
			'displayName' => $this->faker()->sentence(3),
			'downloadCount' => 0,
			'createdAt' => date('Y-m-d H:i:s'),
		];
	}

	/**
	 * Create an image attachment.
	 *
	 * @return static
	 */
	public function image(): static
	{
		return $this->state(fn() => [
			'fileName' => $this->faker()->uuid() . '.jpg',
			'fileType' => 'image/jpeg',
			'fileExtension' => 'jpg',
			'width' => $this->faker()->numberBetween(200, 1920),
			'height' => $this->faker()->numberBetween(200, 1080),
		]);
	}
}

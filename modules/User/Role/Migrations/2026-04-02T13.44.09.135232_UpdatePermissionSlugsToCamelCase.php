<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * UpdatePermissionSlugsToCamelCase
 *
 * Updates permission slugs that used dot-separated or snake_case resource
 * names to camelCase format (e.g. client.contact.create → clientContact.create).
 */
class UpdatePermissionSlugsToCamelCase extends Migration
{
	/**
	 * @var string $connection
	 */
	protected string $connection = 'default';

	/**
	 * Map of old slug → new slug.
	 *
	 * @var array<string, string>
	 */
	private array $slugMap = [
		// Client contacts
		'client.contact.create' => 'clientContact.create',
		'client.contact.view' => 'clientContact.view',
		'client.contact.edit' => 'clientContact.edit',
		'client.contact.delete' => 'clientContact.delete',

		// Client resources
		'client.resource.create' => 'clientResource.create',
		'client.resource.view' => 'clientResource.view',
		'client.resource.edit' => 'clientResource.edit',
		'client.resource.delete' => 'clientResource.delete',

		// Partner sub-resources
		'partner_sub_resource.view' => 'partnerSubResource.view',
		'partner_sub_resource.create' => 'partnerSubResource.create',
		'partner_sub_resource.edit' => 'partnerSubResource.edit',
		'partner_sub_resource.delete' => 'partnerSubResource.delete',

		// Partner matching
		'partner_matching.view' => 'partnerMatching.view',
	];

	/**
	 * Runs the migration.
	 *
	 * @return void
	 */
	public function up(): void
	{
		foreach ($this->slugMap as $oldSlug => $newSlug)
		{
			$this->execute(
				'UPDATE permissions SET slug = ? WHERE slug = ?',
				[$newSlug, $oldSlug]
			);
		}
	}

	/**
	 * Reverts the migration.
	 *
	 * @return void
	 */
	public function down(): void
	{
		foreach ($this->slugMap as $oldSlug => $newSlug)
		{
			$this->execute(
				'UPDATE permissions SET slug = ? WHERE slug = ?',
				[$oldSlug, $newSlug]
			);
		}
	}
}

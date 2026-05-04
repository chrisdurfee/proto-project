<?php declare(strict_types=1);
namespace Modules\User\Search\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Main\Models\User;
use Modules\User\Search\Models\UserSearch;

/**
 * UserSearchTest
 *
 * Tests the safe user search model and controller.
 *
 * @package Modules\User\Search\Tests\Feature
 */
class UserSearchTest extends Test
{
	/**
	 * Test that UserSearch model only returns safe fields.
	 *
	 * @return void
	 */
	public function testModelReturnsSafeFieldsOnly(): void
	{
		$user = User::factory()->create();
		$this->assertNotNull($user->id, 'User should be created');

		$searchResult = UserSearch::get($user->id);
		$this->assertNotNull($searchResult, 'UserSearch should find the user');

		$data = $searchResult->getData();

		// Safe fields should be present
		$this->assertObjectHasProperty('id', $data);
		$this->assertObjectHasProperty('username', $data);
		$this->assertObjectHasProperty('firstName', $data);
		$this->assertObjectHasProperty('lastName', $data);
		$this->assertObjectHasProperty('displayName', $data);
		$this->assertObjectHasProperty('image', $data);
		$this->assertObjectHasProperty('status', $data);
		$this->assertObjectHasProperty('verified', $data);

		// Sensitive fields should NOT be present
		$this->assertObjectNotHasProperty('email', $data);
		$this->assertObjectNotHasProperty('password', $data);
		$this->assertObjectNotHasProperty('mobile', $data);
		$this->assertObjectNotHasProperty('street1', $data);
		$this->assertObjectNotHasProperty('street2', $data);
		$this->assertObjectNotHasProperty('city', $data);
		$this->assertObjectNotHasProperty('state', $data);
		$this->assertObjectNotHasProperty('postalCode', $data);
		$this->assertObjectNotHasProperty('country', $data);
		$this->assertObjectNotHasProperty('dob', $data);
		$this->assertObjectNotHasProperty('lastLoginAt', $data);
		$this->assertObjectNotHasProperty('lastPasswordChangeAt', $data);
		$this->assertObjectNotHasProperty('acceptedTermsAt', $data);
		$this->assertObjectNotHasProperty('emailVerifiedAt', $data);
		$this->assertObjectNotHasProperty('multiFactorEnabled', $data);
		$this->assertObjectNotHasProperty('marketingOptIn', $data);
		$this->assertObjectNotHasProperty('roles', $data);
		$this->assertObjectNotHasProperty('permissions', $data);
		$this->assertObjectNotHasProperty('organizations', $data);
	}

	/**
	 * Test that UserSearch model supports searching by name.
	 *
	 * @return void
	 */
	public function testSearchByName(): void
	{
		$uniqueName = 'SearchTestUser' . uniqid();
		$user = User::factory()->create([
			'firstName' => $uniqueName,
			'lastName' => 'Doe',
			'enabled' => 1
		]);
		$this->assertNotNull($user->id, 'User should be created');

		$results = UserSearch::all(
			(object)['enabled' => 1],
			0,
			50,
			['search' => $uniqueName]
		);

		$this->assertNotNull($results);
		$this->assertNotEmpty($results->rows, 'Should find the user by first name');

		$found = false;
		foreach ($results->rows as $row)
		{
			if ((int)$row->id === (int)$user->id)
			{
				$found = true;
				break;
			}
		}
		$this->assertTrue($found, 'Search results should contain the created user');
	}

	/**
	 * Test that the all method paginates correctly.
	 *
	 * @return void
	 */
	public function testPagination(): void
	{
		$results = UserSearch::all(
			(object)['enabled' => 1],
			0,
			2
		);

		$this->assertNotNull($results);
		$this->assertIsArray($results->rows);
		$this->assertLessThanOrEqual(2, count($results->rows));
	}
}

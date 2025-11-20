<?php declare(strict_types=1);
namespace Modules\Client\Services;

use Common\Services\Service;
use Modules\Client\Models\ClientContact;

/**
 * ClientContactService
 *
 * Handles business logic for client contacts including user account creation/linking.
 *
 * @package Modules\Client\Services
 */
class ClientContactService extends Service
{
	/**
	 * Add a new contact with optional user account creation/linking.
	 *
	 * @param object $data Contact data
	 * @return object Result with contact and user data
	 */
	public function add(object $data): object
	{
		return $this->saveContact($data, null);
	}

	/**
	 * Update an existing contact with optional user account creation/linking.
	 *
	 * @param object $data Contact data
	 * @param int $contactId Existing contact ID
	 * @return object Result with contact and user data
	 */
	public function update(object $data, int $contactId): object
	{
		return $this->saveContact($data, $contactId);
	}

	/**
	 * Create or update a contact with optional user account creation/linking.
	 *
	 * @param object $data Contact data
	 * @param int|null $contactId Existing contact ID (for updates)
	 * @return object Result with contact and user data
	 */
	protected function saveContact(object $data, ?int $contactId = null): object
	{
		try
		{
			// Handle user account creation/linking
			$userId = $this->handleUserAccount($data, $contactId);
			if ($userId)
			{
				$data->userId = $userId;
			}

			// Save or update contact
			if ($contactId)
			{
				// Fetch existing contact to preserve clientId and other immutable fields
				$existingContact = ClientContact::get($contactId);
				if (!$existingContact)
				{
					throw new \Exception('Contact not found');
				}

				// Ensure clientId is preserved
				$data->clientId = $existingContact->clientId;
				$data->id = $contactId;

				$contact = new ClientContact($data);
				if (!$contact->update())
				{
					throw new \Exception('Failed to update contact');
				}

				$contactId = (int)$contact->id;
			}
			else
			{
				$contact = new ClientContact($data);
				if (!$contact->add())
				{
					throw new \Exception('Failed to create contact');
				}

				$contactId = (int)$contact->id;
			}

			// Fetch fresh data with user relation
			$contactData = ClientContact::get($contactId);

			return (object)[
				'success' => true,
				'contact' => $contactData,
				'userId' => $userId
			];
		}
		catch (\Exception $e)
		{
			return (object)[
				'success' => false,
				'error' => $e->getMessage()
			];
		}
	}

	/**
	 * Handle user account creation or linking for a contact.
	 *
	 * @param object $data Contact/user data
	 * @param int|null $contactId Existing contact ID
	 * @return int|null User ID
	 */
	protected function handleUserAccount(object $data, ?int $contactId = null): ?int
	{
		$createUser = $data->createUser ?? false;
		$linkUserId = $data->linkUserId ?? null;

		// If linking to existing user
		if ($linkUserId)
		{
			$user = modules()->user()->get((int)$linkUserId);
			if ($user)
			{
				return (int)$user->id;
			}
		}

		// If creating new user account
		if ($createUser)
		{
			return $this->createUserAccount($data);
		}

		// If updating and contact already has a user
		if ($contactId)
		{
			$contact = ClientContact::get($contactId);
			if ($contact && $contact->userId)
			{
				// Update user with any provided name/dob/user fields
				$this->updateUserFromContactData((int)$contact->userId, $data);
				return (int)$contact->userId;
			}

			// If contact doesn't have a user but has user-related data (name, dob, etc)
			// automatically create one
			if ($this->hasUserData($data))
			{
				return $this->createUserAccount($data);
			}
		}

		return null;
	}

	/**
	 * Check if data contains user-related fields that should be stored in user table.
	 *
	 * @param object $data Contact data
	 * @return bool
	 */
	protected function hasUserData(object $data): bool
	{
		return isset($data->firstName) || isset($data->lastName) || isset($data->dob);
	}

	/**
	 * Update user account with data from contact update.
	 *
	 * @param int $userId User ID
	 * @param object $contactData Contact data that may include user fields
	 * @return void
	 */
	protected function updateUserFromContactData(int $userId, object $contactData): void
	{
		$userData = (object)[];
		$hasUserData = false;

		// Map contact data fields to user fields
		if (isset($contactData->firstName))
		{
			$userData->firstName = $contactData->firstName;
			$hasUserData = true;
		}
		if (isset($contactData->lastName))
		{
			$userData->lastName = $contactData->lastName;
			$hasUserData = true;
		}
		if (isset($contactData->dob))
		{
			$userData->dob = $contactData->dob;
			$hasUserData = true;
		}
		if (isset($contactData->email))
		{
			$userData->email = $contactData->email;
			$hasUserData = true;
		}
		if (isset($contactData->language))
		{
			$userData->language = $contactData->language;
			$hasUserData = true;
		}
		if (isset($contactData->timezone))
		{
			$userData->timezone = $contactData->timezone;
			$hasUserData = true;
		}

		// Update display name if first or last name changed
		if (isset($contactData->firstName) || isset($contactData->lastName))
		{
			$firstName = $contactData->firstName ?? '';
			$lastName = $contactData->lastName ?? '';
			$userData->displayName = trim($firstName . ' ' . $lastName);
		}

		// If user object is provided, merge it
		if (isset($contactData->user) && is_object($contactData->user))
		{
			foreach ($contactData->user as $key => $value)
			{
				$userData->$key = $value;
			}
			$hasUserData = true;
		}

		if ($hasUserData)
		{
			$this->updateUserAccount($userId, $userData);
		}
	}

	/**
	 * Create a new user account for the contact.
	 *
	 * @param object $data Contact and user data
	 * @return int|null User ID
	 */
	protected function createUserAccount(object $data): ?int
	{
		$userData = (object)[
			'firstName' => $data->firstName ?? '',
			'lastName' => $data->lastName ?? '',
			'email' => $data->email ?? '',
			'dob' => $data->dob ?? null,
			'displayName' => trim(($data->firstName ?? '') . ' ' . ($data->lastName ?? '')),
			'username' => $data->user->username ?? $data->email ?? '',
			'password' => $data->user->password ?? $this->generateRandomPassword(),
			'enabled' => $data->user->enabled ?? 1,
			'status' => $data->user->status ?? 'offline',
			'timezone' => $data->timezone ?? 'utc',
			'language' => $data->language ?? 'en'
		];

		// Create user using the User module gateway
		$user = modules()->user()->create($userData);
		if (!$user && !isset($user->id))
		{
			return null;
		}

		$userId = (int)$user->id;

		// Assign default roles
		$this->assignRoles($userId);

		return $userId;
	}

	/**
	 * Update an existing user account.
	 *
	 * @param int $userId User ID
	 * @param object $userData User data
	 * @return bool Success status
	 */
	protected function updateUserAccount(int $userId, object $userData): bool
	{
		$user = modules()->user()->get($userId);
		if (!$user)
		{
			return false;
		}

		// Restrict fields that shouldn't be updated
		$restrictedFields = ['id', 'uuid', 'createdAt', 'createdBy', 'deletedAt', 'roles'];
		$this->restrictFields($userData, $restrictedFields);

		// Set the user ID for the update
		$userData->id = $userId;
		if (!empty((array)$userData))
		{
			modules()->user()->update($userData);
		}

		return true;
	}

	/**
	 * Assign default roles to a user.
	 *
	 * Default roles assigned: contributor, user, guest
	 *
	 * @param int $userId User ID
	 * @return void
	 */
	protected function assignRoles(int $userId): void
	{
		$defaultRoleSlugs = ['contributor', 'user', 'guest'];
		$roleGateway = modules()->user()->role();

		foreach ($defaultRoleSlugs as $slug)
		{
			$role = $roleGateway->getBySlug($slug);
			if ($role)
			{
				$roleGateway->add($userId, (int)$role->id);
			}
		}
	}

	/**
	 * Generate a random password.
	 *
	 * @return string
	 */
	protected function generateRandomPassword(): string
	{
		return bin2hex(random_bytes(16));
	}
}

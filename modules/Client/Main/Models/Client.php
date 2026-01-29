<?php declare(strict_types=1);
namespace Modules\Client\Main\Models;

use Proto\Models\Model;

/**
 * Client
 *
 * @package Modules\Client\Main\Models
 */
class Client extends Model
{
	/**
	 * @var string|null $tableName
	 */
	protected static ?string $tableName = 'clients';

	/**
	 * @var string|null $alias
	 */
	protected static ?string $alias = 'c';

	/**
	 * @var array $fields
	 */
	protected static array $fields = [
		'id',
		'uuid',
		'companyName',
		'clientType',
		'clientNumber',
		'website',
		'industry',
		'taxId',
		'employeeCount',
		'annualRevenue',
		'street1',
		'street2',
		'city',
		'state',
		'postalCode',
		'country',
		'billingStreet1',
		'billingStreet2',
		'billingCity',
		'billingState',
		'billingPostalCode',
		'billingCountry',
		'status',
		'priority',
		'leadSource',
		'rating',
		'tags',
		'currency',
		'paymentTerms',
		'creditLimit',
		'totalRevenue',
		'outstandingBalance',
		'assignedTo',
		'createdByUserId',
		'firstContactDate',
		'lastContactDate',
		'lastActivityAt',
		'nextFollowUpDate',
		'linkedinUrl',
		'twitterHandle',
		'facebookUrl',
		'preferredContactMethod',
		'language',
		'timezone',
		'marketingOptIn',
		'newsletterSubscribed',
		'notes',
		'internalNotes',
		'customFields',
		'isVip',
		'doNotContact',
		'emailBounced',
		'verified',
		'createdAt',
		'updatedAt',
		'updatedBy',
		'deletedAt'
	];

	/**
	 * Get searchable fields for the model.
	 *
	 * @return array
	 */
	public function getSearchableFields(): array
	{
		return [
			'id',
			'company_name',
			'client_number'
		];
	}

}

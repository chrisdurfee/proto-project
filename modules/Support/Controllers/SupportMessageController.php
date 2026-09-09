<?php declare(strict_types=1);
namespace Modules\Support\Controllers;

use Modules\Support\Auth\Policies\SupportMessagePolicy;
use Modules\Support\Models\SupportMessage;
use Proto\Controllers\ResourceController;
use Proto\Http\Router\Request;

/**
 * SupportMessageController
 *
 * Handles Help Center submissions: contact requests, bug reports, and
 * support questions.
 *
 * @package Modules\Support\Controllers
 */
class SupportMessageController extends ResourceController
{
	/**
	 * @var string|null $policy
	 */
	protected ?string $policy = SupportMessagePolicy::class;

	/**
	 * Constructor
	 *
	 * @param string|null $model The model class reference using ::class.
	 */
	public function __construct(
		protected ?string $model = SupportMessage::class
	)
	{
		parent::__construct();
	}

	/**
	 * Validation rules for submitted messages.
	 *
	 * @return array
	 */
	protected function validate(): array
	{
		return [
			'category' => 'string:20',
			'subject' => 'required|string:255',
			'message' => 'required|string',
			'email' => 'email'
		];
	}

	/**
	 * Whether the acting user may see other people's tickets.
	 *
	 * @return bool
	 */
	protected function isSupportStaff(): bool
	{
		if (!auth()->user->isSignedIn())
		{
			return false;
		}

		return auth()->role->hasRole('admin') || auth()->permission->hasPermission('support.access');
	}

	/**
	 * Restricts listing to the acting user's own tickets unless they are
	 * support staff. The policy only checks that the caller is signed in,
	 * so this filter is what actually keeps tickets private.
	 *
	 * @param object|null $filter
	 * @param Request $request
	 * @return object|null
	 */
	protected function modifyFilter(?object $filter, Request $request): ?object
	{
		$filter = parent::modifyFilter($filter, $request);

		if (!$this->isSupportStaff())
		{
			$filter ??= (object)[];
			$filter->userId = (int)session()->user->id;
		}

		return $this->qualifyAmbiguousFilters($filter);
	}

	/**
	 * Prefixes columns that also exist on the joined users table so the
	 * WHERE clause stays unambiguous.
	 *
	 * @param object|null $filter
	 * @return object|null
	 */
	private function qualifyAmbiguousFilters(?object $filter): ?object
	{
		if (!$filter)
		{
			return $filter;
		}

		foreach (['status', 'email'] as $field)
		{
			if (isset($filter->$field))
			{
				$prefixed = "sm.{$field}";
				$filter->$prefixed = $filter->$field;
				unset($filter->$field);
			}
		}

		return $filter;
	}

	/**
	 * Stamps the submitter from the session and forces a safe initial
	 * status, so a client cannot file a ticket as somebody else or open
	 * one that is already marked resolved.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifyAddItem(object &$data, Request $request): void
	{
		$data->userId = session()->user->id ?? null;
		$data->status = 'open';
		$data->resolvedAt = null;
		$data->resolvedBy = null;

		if (empty($data->category) || !in_array($data->category, ['support', 'bug', 'contact'], true))
		{
			$data->category = 'support';
		}
	}

	/**
	 * Records who resolved a ticket and when.
	 *
	 * @param object $data
	 * @param Request $request
	 * @return void
	 */
	protected function modifyUpdateItem(object &$data, Request $request): void
	{
		$status = $data->status ?? null;
		if ($status === 'resolved' || $status === 'closed')
		{
			$data->resolvedAt = date('Y-m-d H:i:s');
			$data->resolvedBy = session()->user->id ?? null;
			return;
		}

		$data->resolvedAt = null;
		$data->resolvedBy = null;
	}
}

<?php declare(strict_types=1);

namespace Modules\Developer\Tests\Feature;

use Modules\Developer\Auth\Gates\EnvGate;
use Modules\Developer\Auth\Policies\DeveloperPolicy;
use Modules\Developer\Auth\Policies\OperationsPolicy;
use Proto\Http\Router\Request;
use Proto\Tests\Test;

/**
 * OperationsPolicyTest
 *
 * Locks down CRM Platform operations APIs: admins everywhere,
 * local developer.access holders on env=dev, everyone else denied.
 *
 * @package Modules\Developer\Tests\Feature
 */
class OperationsPolicyTest extends Test
{
	/**
	 * @return void
	 */
	protected function tearDown(): void
	{
		session()->user = null;
		parent::tearDown();
	}

	/**
	 * @param array $roles
	 * @return void
	 */
	protected function signInWithRoles(array $roles): void
	{
		session()->user = (object)[
			'id' => 1,
			'roles' => $roles
		];
	}

	/**
	 * @param bool $isDev
	 * @return EnvGate
	 */
	protected function gate(bool $isDev): EnvGate
	{
		return new class($isDev) extends EnvGate
		{
			/**
			 * @param bool $isDev
			 */
			public function __construct(private bool $isDev)
			{
			}

			/**
			 * @return bool
			 */
			public function isDev(): bool
			{
				return $this->isDev;
			}
		};
	}

	/**
	 * Guests cannot reach operations endpoints.
	 *
	 * @return void
	 */
	public function testUnauthenticatedIsDenied(): void
	{
		$policy = new OperationsPolicy(null, $this->gate(false));
		$this->assertFalse($policy->default(new Request()));
	}

	/**
	 * Non-admin users are denied outside the local developer environment.
	 *
	 * @return void
	 */
	public function testNonAdminDeniedOutsideDev(): void
	{
		$this->signInWithRoles([
			(object)['slug' => 'member', 'permissions' => []]
		]);

		$policy = new OperationsPolicy(null, $this->gate(false));
		$this->assertFalse($policy->default(new Request()));
	}

	/**
	 * Admins may use operations tooling in non-dev environments (CRM).
	 *
	 * @return void
	 */
	public function testAdminAllowedOutsideDev(): void
	{
		$this->signInWithRoles([
			(object)['slug' => 'admin', 'permissions' => []]
		]);

		$policy = new OperationsPolicy(null, $this->gate(false));
		$this->assertTrue($policy->default(new Request()));
	}

	/**
	 * CRM staff with crm.access may read cron telemetry outside local,
	 * but not other operations tooling (migrations, errors, email).
	 *
	 * @return void
	 */
	public function testCrmAccessAllowsCronTelemetryOutsideDev(): void
	{
		$this->signInWithRoles([
			(object)[
				'slug' => 'manager',
				'permissions' => [
					(object)['slug' => 'crm.access']
				]
			]
		]);

		$policy = new OperationsPolicy(null, $this->gate(false));
		$this->assertFalse($policy->default(new Request()));
		$this->assertTrue($policy->jobs(new Request()));
		$this->assertTrue($policy->runs(new Request()));
	}

	/**
	 * Local developer.access holders retain access on env=dev.
	 *
	 * @return void
	 */
	public function testDeveloperAccessAllowedInDev(): void
	{
		$this->signInWithRoles([
			(object)[
				'slug' => 'developer',
				'permissions' => [
					(object)['slug' => 'developer.access']
				]
			]
		]);

		$policy = new OperationsPolicy(null, $this->gate(true));
		$this->assertTrue($policy->default(new Request()));
	}

	/**
	 * developer.access alone is not enough outside local.
	 *
	 * @return void
	 */
	public function testDeveloperAccessDeniedOutsideDev(): void
	{
		$this->signInWithRoles([
			(object)[
				'slug' => 'developer',
				'permissions' => [
					(object)['slug' => 'developer.access']
				]
			]
		]);

		$policy = new OperationsPolicy(null, $this->gate(false));
		$this->assertFalse($policy->default(new Request()));
	}

	/**
	 * Local-only DeveloperPolicy still blocks admins outside env=dev.
	 *
	 * @return void
	 */
	public function testLocalDeveloperPolicyBlocksAdminOutsideDev(): void
	{
		$this->signInWithRoles([
			(object)['slug' => 'admin', 'permissions' => []]
		]);

		$policy = new DeveloperPolicy(null, $this->gate(false));
		$this->assertFalse($policy->default(new Request()));
	}

	/**
	 * Local-only DeveloperPolicy still allows admins on env=dev.
	 *
	 * @return void
	 */
	public function testLocalDeveloperPolicyAllowsAdminInDev(): void
	{
		$this->signInWithRoles([
			(object)['slug' => 'admin', 'permissions' => []]
		]);

		$policy = new DeveloperPolicy(null, $this->gate(true));
		$this->assertTrue($policy->default(new Request()));
	}

	/**
	 * Local-only DeveloperPolicy denies guests even on env=dev.
	 *
	 * @return void
	 */
	public function testLocalDeveloperPolicyDeniesGuestInDev(): void
	{
		$policy = new DeveloperPolicy(null, $this->gate(true));
		$this->assertFalse($policy->default(new Request()));
	}
}

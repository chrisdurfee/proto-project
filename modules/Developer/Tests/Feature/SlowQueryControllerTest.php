<?php declare(strict_types=1);

namespace Modules\Developer\Tests\Feature;

use Modules\Developer\Controllers\SlowQueryController;
use Proto\Http\Router\Request;
use Proto\Tests\Test;

/**
 * SlowQueryControllerTest
 *
 * @package Modules\Developer\Tests\Feature
 */
class SlowQueryControllerTest extends Test
{
	/**
	 * @return void
	 */
	protected function tearDown(): void
	{
		unset($_REQUEST['filter'], $_REQUEST['offset'], $_REQUEST['limit'], $_REQUEST['orderBy'], $_REQUEST['search']);
		parent::tearDown();
	}

	/**
	 * @return void
	 */
	public function testAllReturnsSuccessShape(): void
	{
		$_REQUEST['filter'] = json_encode(['mode' => 'genuine']);
		$_REQUEST['offset'] = '0';
		$_REQUEST['limit'] = '10';
		$_REQUEST['orderBy'] = json_encode(['startTime' => 'DESC']);

		$response = (new SlowQueryController())->all(new Request());

		$this->assertTrue((bool)($response->success ?? false));
		$this->assertIsArray($response->rows ?? null);
		$this->assertObjectHasProperty('tableEnabled', $response);
		$this->assertObjectHasProperty('longQueryTime', $response);
		$this->assertSame('genuine', $response->mode ?? null);
	}

	/**
	 * @return void
	 */
	public function testUnknownModeFallsBackToGenuine(): void
	{
		$_REQUEST['filter'] = json_encode(['mode' => 'moonbase']);

		$response = (new SlowQueryController())->all(new Request());

		$this->assertTrue((bool)($response->success ?? false));
		$this->assertSame('genuine', $response->mode ?? null);
	}

	/**
	 * @return void
	 */
	public function testUnindexedModeIsAccepted(): void
	{
		$_REQUEST['filter'] = json_encode(['mode' => 'unindexed']);
		$_REQUEST['limit'] = '5';

		$response = (new SlowQueryController())->all(new Request());

		$this->assertTrue((bool)($response->success ?? false));
		$this->assertSame('unindexed', $response->mode ?? null);
	}
}

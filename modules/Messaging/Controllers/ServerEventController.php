<?php declare(strict_types=1);
namespace Modules\Messaging\Controllers;

use Proto\Controllers\ApiController;
use Proto\Http\Router\Request;

/**
 * ServerEventController
 *
 * @package Modules\Messaging\Controllers
 */
class ServerEventController extends ApiController
{
	/**
	 * Test SSE endpoint.
	 *
	 * @param Request $request
	 * @return void
	 */
	public function test(Request $request): void
	{
		$conversationId = (int)($request->params()->conversationId ?? null);
		if (!$conversationId)
		{
			return;
		}

		// Aggressive configuration
		ini_set('output_buffering', 'off');
		ini_set('zlib.output_compression', 'off');
		ini_set('implicit_flush', '1');
		set_time_limit(0);
		ignore_user_abort(false);

		// Close all output buffers
		while (ob_get_level()) {
			ob_end_clean();
		}

		// Enable implicit flush at PHP level
		ob_implicit_flush(true);

		// Send headers
		header('Content-Type: text/event-stream');
		header('Cache-Control: no-cache, no-store, must-revalidate');
		header('Pragma: no-cache');
		header('Expires: 0');
		header('Connection: keep-alive');
		header('X-Accel-Buffering: no');
		header('X-Content-Type-Options: nosniff');

		// CRITICAL: Force chunked encoding (no Content-Length)
		header('Transfer-Encoding: chunked');

		// Disable Apache/PHP-FPM buffering
		if (function_exists('apache_setenv')) {
			apache_setenv('no-gzip', '1');
		}

		// Send padding to force browser/proxy to start processing immediately
		echo ':' . str_repeat(' ', 2048) . "\n\n";
		echo "retry: 10000\n\n";
		@ob_flush();
		flush();

		// Send initial comment to establish connection
		echo ": SSE Connection Established\n\n";
		@ob_flush();
		flush();

		// Send 10 events, one per second
		for ($i = 1; $i <= 10; $i++) {
			$data = json_encode(['tick' => $i, 'time' => date('H:i:s')]);
			echo "data: {$data}\n\n";
			@ob_flush();
			flush();

			if (connection_aborted()) {
				break;
			}

			sleep(1); // Wait 1 second between events
		}

		echo "data: {\"message\":\"Complete\"}\n\n";
		@ob_flush();
		flush();
	}
}
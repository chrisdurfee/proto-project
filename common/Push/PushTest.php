<?php declare(strict_types=1);
namespace Common\Push;

/**
 * Class PushTest
 *
 * Test implementation of the Push notification class.
 *
 * @package Common\Push
 */
class PushTest extends Push
{
	/**
	 * Sets up the body for the push notification.
	 *
	 * @abstract
	 * @return string|array
	 */
	protected function setupBody(): string|array
	{
		$ticket = $this->get('ticket');

		return [
			'title' => "Test push message.",
			'message' => $this->getMessage()
		];
	}

	/**
	 * Gets the message for the push notification.
	 *
	 * @return string
	 */
	protected function getMessage(): string
	{
		return <<<EOT
Push notification is working.
EOT;
	}
}
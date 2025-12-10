<?php declare(strict_types=1);
namespace Common\Text;

/**
 * TestMessage
 *
 * Test implementation of the Text message class.
 *
 * @package Common\Text
 */
class TestMessage extends Text
{
	/**
	 * Sets up the body for the text message.
	 *
	 * @abstract
	 * @return string
	 */
	protected function setupBody(): string
	{
		return <<<EOT
This is a test sms.
EOT;
	}
}
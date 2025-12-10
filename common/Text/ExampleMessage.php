<?php declare(strict_types=1);
namespace Common\Text;

/**
 * ExampleMessage
 *
 * Example implementation of the Text message class.
 *
 * @package Common\Text
 */
class ExampleMessage extends Text
{
	/**
	 * Sets up the body for the text message.
	 *
	 * @abstract
	 * @return string
	 */
	protected function setupBody(): string
	{
		$url = $this->get('url');

		return <<<EOT
Click the url {$url} to view message.
EOT;
	}
}
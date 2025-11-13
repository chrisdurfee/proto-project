<?php declare(strict_types=1);
namespace Modules\Messaging\Push;

use Common\Push\Push;

/**
 * Class NewMessage
 *
 * This class is used for sending new message push notifications.
 *
 * @package Modules\Messaging\Push
 */
class NewMessage extends Push
{
	/**
	 * This should be overridden to return the message body.
	 *
	 * @abstract
	 * @return string|array
	 */
	protected function setupBody(): string|array
	{
		$displayName = $this->get('displayName');
		$conversationId = $this->get('conversationId');

		return [
			'url' => "/messages/{$conversationId}",
			'title' => "New message from {$displayName}.",
			'message' => $this->getMessage()
		];
	}

	/**
	 * This will limit the text length.
	 *
	 * @param string $message
	 * @param int $limit
	 * @return string
	 */
	protected function limitText(string $message, int $limit = 200): string
	{
		if (strlen($message) > $limit)
		{
			$message = substr($message, 0, $limit - 3) . '...';
		}
		return $message;
	}

	/**
	 * This will get the message.
	 *
	 * @return string
	 */
	protected function getMessage(): string
	{
		$message = $this->get('message');
		$message = $this->limitText($message);

		return <<<EOT
{$message}
EOT;
	}
}
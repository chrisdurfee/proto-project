<?php declare(strict_types=1);

namespace Modules\Support\Tests\Feature;

use Modules\Support\Models\SupportMessage;
use Modules\User\Main\Models\Factories\UserFactory;
use Proto\Tests\Test;

/**
 * SupportMessageTest
 *
 * Covers the Help Center submission model: that a ticket can be filed
 * by a signed-in user or an anonymous visitor, and that the fields a
 * submitter must not be able to rewrite are immutable.
 *
 * @package Modules\Support\Tests\Feature
 */
class SupportMessageTest extends Test
{
	/**
	 * @var int|null $userId
	 */
	protected ?int $userId = null;

	/**
	 * @return void
	 */
	protected function setUp(): void
	{
		parent::setUp();

		$this->userId = (int)UserFactory::new()->create()->id;
	}

	/**
	 * A signed-in user's ticket records the submitter.
	 *
	 * @return void
	 */
	public function testItStoresAMessageForAUser(): void
	{
		$message = new SupportMessage((object)[
			'userId' => $this->userId,
			'category' => 'bug',
			'subject' => 'Upload fails on large files',
			'message' => 'Selecting a 40MB file returns a 500.',
			'status' => 'open'
		]);

		$this->assertTrue($message->add());

		$stored = SupportMessage::getWithoutJoins((int)$message->id);
		$this->assertNotNull($stored);
		$this->assertEquals($this->userId, (int)$stored->userId);
		$this->assertEquals('bug', $stored->category);
		$this->assertEquals('open', $stored->status);
	}

	/**
	 * The contact form must work for a signed-out visitor, so userId is
	 * nullable and the reply address is captured instead.
	 *
	 * @return void
	 */
	public function testItStoresAnAnonymousContactMessage(): void
	{
		$message = new SupportMessage((object)[
			'userId' => null,
			'category' => 'contact',
			'subject' => 'Question about pricing',
			'message' => 'Do you offer a nonprofit discount?',
			'email' => 'visitor@example.com',
			'status' => 'open'
		]);

		$this->assertTrue($message->add());

		$stored = SupportMessage::getWithoutJoins((int)$message->id);
		$this->assertNotNull($stored);
		$this->assertNull($stored->userId);
		$this->assertEquals('visitor@example.com', $stored->email);
	}

	/**
	 * A status change must not be able to rewrite the original report.
	 *
	 * @return void
	 */
	public function testItDoesNotAllowRewritingTheOriginalReport(): void
	{
		$message = new SupportMessage((object)[
			'userId' => $this->userId,
			'category' => 'bug',
			'subject' => 'Original subject',
			'message' => 'Original message',
			'status' => 'open'
		]);
		$this->assertTrue($message->add());

		$update = new SupportMessage((object)[
			'id' => $message->id,
			'subject' => 'Tampered subject',
			'message' => 'Tampered message',
			'category' => 'contact',
			'status' => 'resolved'
		]);
		$update->update();

		$stored = SupportMessage::getWithoutJoins((int)$message->id);
		$this->assertEquals('Original subject', $stored->subject);
		$this->assertEquals('Original message', $stored->message);
		$this->assertEquals('bug', $stored->category);
		$this->assertEquals('resolved', $stored->status);
	}
}

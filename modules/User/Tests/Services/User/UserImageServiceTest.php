<?php declare(strict_types=1);
namespace Modules\User\Tests\Services\User;

use PHPUnit\Framework\TestCase;
use Modules\User\Services\User\UserImageService;

/**
 * UserImageServiceTest
 *
 * Unit tests for the UserImageService class.
 *
 * @package Modules\User\Tests\Services\User
 */
class UserImageServiceTest extends TestCase
{
	private UserImageService $service;

	protected function setUp(): void
	{
		$this->service = new UserImageService();
	}

	/**
	 * Test that the service validates file extensions correctly.
	 */
	public function testValidateImageWithValidExtensions(): void
	{
		$mockFile = $this->createMockUploadFile('test.jpg', 1024);
		$result = $this->service->validateImage($mockFile);

		$this->assertTrue($result['valid']);
		$this->assertNull($result['error']);
	}

	/**
	 * Test that the service rejects invalid file extensions.
	 */
	public function testValidateImageWithInvalidExtension(): void
	{
		$mockFile = $this->createMockUploadFile('test.txt', 1024);
		$result = $this->service->validateImage($mockFile);

		$this->assertFalse($result['valid']);
		$this->assertStringContainsString('Invalid file type', $result['error']);
	}

	/**
	 * Test that the service rejects files that are too large.
	 */
	public function testValidateImageWithLargeFile(): void
	{
		$largeSize = 40 * 1024 * 1024; // 40MB (larger than 30MB limit)
		$mockFile = $this->createMockUploadFile('test.jpg', $largeSize);
		$result = $this->service->validateImage($mockFile);

		$this->assertFalse($result['valid']);
		$this->assertStringContainsString('File size too large', $result['error']);
	}

	/**
	 * Test that the service handles null upload files.
	 */
	public function testValidateImageWithNullFile(): void
	{
		$result = $this->service->validateImage(null);

		$this->assertFalse($result['valid']);
		$this->assertEquals('No image file provided.', $result['error']);
	}

	/**
	 * Test getting allowed extensions.
	 */
	public function testGetAllowedExtensions(): void
	{
		$extensions = $this->service->getAllowedExtensions();

		$this->assertIsArray($extensions);
		$this->assertContains('jpg', $extensions);
		$this->assertContains('png', $extensions);
		$this->assertContains('gif', $extensions);
		$this->assertContains('webp', $extensions);
	}

	/**
	 * Test getting max file size.
	 */
	public function testGetMaxFileSize(): void
	{
		$maxSize = $this->service->getMaxFileSize();

		$this->assertIsInt($maxSize);
		$this->assertEquals(30 * 1024 * 1024, $maxSize); // 30MB
	}

	/**
	 * Creates a mock upload file for testing.
	 *
	 * @param string $fileName The file name.
	 * @param int $fileSize The file size in bytes.
	 * @return object Mock upload file object.
	 */
	private function createMockUploadFile(string $fileName, int $fileSize): object
	{
		$mockFile = $this->createMock(\stdClass::class);

		$mockFile->method('getName')
			->willReturn($fileName);

		$mockFile->method('getSize')
			->willReturn($fileSize);

		return $mockFile;
	}
}
import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../types/doc/doc-page.js";

/**
 * CodeBlock
 *
 * Creates a code block with copy-to-clipboard functionality.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const CodeBlock = Atom((props, children) => (
	Pre(
		{
			...props,
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto
                     rounded-lg border bg-muted whitespace-break-spaces
                     break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: "font-mono flex-auto text-sm text-wrap",
					click: () => {
						navigator.clipboard.writeText(children[0].textContent);
						// @ts-ignore
						app.notify({
							title: "Code copied",
							description: "The code has been copied to your clipboard.",
							icon: null
						});
					}
				},
				children
			)
		]
	)
));

/**
 * TestsPage
 *
 * This page explains the comprehensive Proto testing system built on PHPUnit.
 * It covers enhanced features including database testing utilities, model helpers,
 * HTTP testing, mocking, file system testing, and much more.
 *
 * @returns {DocPage}
 */
export const TestsPage = () =>
	DocPage(
		{
			title: 'Tests',
			description: 'Comprehensive testing system with powerful utilities for database, HTTP, and model testing.'
		},
		[
			// Overview
			Section({ class: "flex flex-col gap-y-4" }, [
				H4({ class: "text-lg font-bold" }, "Overview"),
				P(
					{ class: "text-muted-foreground" },
					`Proto's enhanced testing system is built on PHPUnit and provides powerful utilities
					to make testing more efficient and maintainable. The system includes database testing
					with automatic transactions, model creation helpers, HTTP request testing with fluent
					assertions, comprehensive mocking capabilities, file system testing, and fake data
					generation. This framework transforms testing from writing repetitive boilerplate to
					focusing on actual test logic.`
				)
			]),

			// Getting Started
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Getting Started"),
				P(
					{ class: "text-muted-foreground" },
					`All test classes should extend the Proto\\Tests\\Test base class which provides
					access to all testing utilities:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\YourModule\\Tests\\Unit;

use Proto\\Tests\\Test;

class YourTest extends Test
{
    public function testSomething(): void
    {
        // Your test code here with access to all Proto testing utilities
    }
}`
				)
			]),

			// Database Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Database Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides powerful database testing utilities with automatic transaction handling
					to ensure test isolation and fast cleanup:`
				),
				CodeBlock(
`class UserTest extends Test
{
    // Database transactions are enabled by default
    public function testUserCreation(): void
    {
        // This will be rolled back automatically
        $this->assertDatabaseCount('users', 0);
    }

    // Disable transactions for specific tests if needed
    protected function setUp(): void
    {
        parent::setUp();
        $this->setUseTransactions(false);
    }
}

// Database Assertions
class DatabaseAssertionTest extends Test
{
    public function testDatabaseAssertions(): void
    {
        $user = $this->createModel(User::class, [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        // Assert table contains data
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);

        // Assert table doesn't contain data
        $this->assertDatabaseMissing('users', ['email' => 'deleted@example.com']);

        // Assert table count
        $this->assertDatabaseCount('users', 1);

        $user->delete();

        // Assert record was deleted
        $this->assertDatabaseMissing('users', ['email' => 'john@example.com']);
    }
}`
				)
			]),

			// Database Seeding
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Database Seeding"),
				P(
					{ class: "text-muted-foreground" },
					`Automatically seed your test database with the data you need:`
				),
				CodeBlock(
`class UserTest extends Test
{
    // Define seeders to run before each test
    protected array $seeders = [
        UserSeeder::class,
        RoleSeeder::class
    ];

    public function testWithSeededData(): void
    {
        // Seeders run automatically before each test
        $this->assertDatabaseCount('users', 10);
        $this->assertDatabaseCount('roles', 3);

        // Test with pre-seeded data
        $adminUser = User::where('role', 'admin')->first();
        $this->assertNotNull($adminUser);
    }
}`
				)
			]),

			// Model Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Model Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Comprehensive model testing utilities for creation, manipulation, and assertions:`
				),
				CodeBlock(
`class ModelTest extends Test
{
    public function testModelCreation(): void
    {
        // Create and persist a model
        $user = $this->createModel(User::class, [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        // Create model without persisting to database
        $draftUser = $this->makeModel(User::class, [
            'name' => 'Draft User'
        ]);

        // Create multiple models
        $users = $this->createMultiple(User::class, 5, [
            'status' => 'active'
        ]);

        $this->assertCount(5, $users);
    }

    public function testModelAssertions(): void
    {
        $user = $this->createModel(User::class, [
            'name' => 'John Doe',
            'status' => 'active'
        ]);

        // Assert model exists in database
        $this->assertModelExists($user);

        // Assert model has specific attributes
        $this->assertModelHasAttributes($user, [
            'name' => 'John Doe',
            'status' => 'active'
        ]);

        // Test model equality
        $sameUser = User::find($user->id);
        $this->assertModelEquals($user, $sameUser);

        $user->delete();

        // Assert model doesn't exist
        $this->assertModelMissing($user);
    }
}`
				)
			]),

			// HTTP Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "HTTP Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Comprehensive HTTP testing with fluent assertions for API endpoints:`
				),
				CodeBlock(
`class ApiTest extends Test
{
    public function testMakingRequests(): void
    {
        // JSON requests
        $response = $this->getJson('/api/users');
        $response = $this->postJson('/api/users', ['name' => 'John']);
        $response = $this->putJson('/api/users/1', ['name' => 'Jane']);
        $response = $this->patchJson('/api/users/1', ['status' => 'inactive']);
        $response = $this->deleteJson('/api/users/1');

        // Regular requests
        $response = $this->get('/users');
        $response = $this->post('/users', ['name' => 'John']);
    }

    public function testAuthentication(): void
    {
        $user = $this->createModel(User::class);

        // Test as authenticated user
        $response = $this->actingAs($user)->getJson('/api/profile');
        $response->assertSuccessful();

        // Test with token
        $jwt = 'your-jwt-token';
        $response = $this->withToken($jwt)->getJson('/api/protected');

        // Test with session data
        $response = $this->withSession(['user_id' => 1])->get('/dashboard');
    }

    public function testResponseAssertions(): void
    {
        $user = $this->createModel(User::class, [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $response = $this->getJson("/api/users/{$user->id}");

        // Status assertions
        $response->assertStatus(200);
        $response->assertSuccessful();

        // JSON assertions
        $response->assertJson([
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $response->assertJsonFragment(['name' => 'John Doe']);
        $response->assertJsonMissing(['password']);

        $response->assertJsonStructure([
            'id',
            'name',
            'email',
            'created_at'
        ]);

        // Test error responses
        $response = $this->getJson('/api/users/999');
        $response->assertStatus(404);

        // Test validation errors
        $response = $this->postJson('/api/users', ['email' => 'invalid']);
        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['email']]);
    }
}`
				)
			]),

			// Mock and Spy Helpers
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Mock and Spy Helpers"),
				P(
					{ class: "text-muted-foreground" },
					`Powerful mocking and spying capabilities for testing service interactions:`
				),
				CodeBlock(
`class ServiceTest extends Test
{
    public function testCreatingMocks(): void
    {
        // Mock a service
        $mockService = $this->mockService(EmailService::class);
        $this->expectMethodCall($mockService, 'send', ['test@example.com'], true);

        // Create a spy (tracks method calls on real object)
        $spyService = $this->spyService(LogService::class);

        // Partial mock (mock some methods, keep others real)
        $partialMock = $this->partialMock(PaymentService::class, ['charge']);

        // Stub with predefined returns
        $stub = $this->createStub(ConfigService::class, [
            'get' => 'test_value',
            'has' => true
        ]);

        // Use the stub
        $this->assertEquals('test_value', $stub->get('any_key'));
        $this->assertTrue($stub->has('any_key'));
    }

    public function testMockExpectations(): void
    {
        $mock = $this->mockService(NotificationService::class);

        // Expect method to be called with specific arguments
        $this->expectMethodCall($mock, 'notify', ['user@example.com', 'Welcome!']);

        // Expect method never to be called
        $this->expectMethodNeverCalled($mock, 'sendSms');

        // Fluent expectations
        $mock = $this->mockWithExpectations(UserService::class, function($mock, $test) {
            $mock->expects($test->once())
                 ->method('create')
                 ->with(['name' => 'John'])
                 ->willReturn(new User());
        });

        // Trigger the mocked behavior
        $user = $mock->create(['name' => 'John']);
        $this->assertInstanceOf(User::class, $user);
    }
}`
				)
			]),

			// File System Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "File System Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Test file operations, uploads, and file system interactions:`
				),
				CodeBlock(
`class FileSystemTest extends Test
{
    public function testFileOperations(): void
    {
        // Create test file
        $this->createTestFile('/tmp/test.txt', 'Hello World');

        // Create test directory
        $this->createTestDirectory('/tmp/test_dir');

        // Copy file for testing
        $this->copyFileForTest('/path/to/source', '/tmp/copy.txt');

        // File assertions
        $this->assertTestFileExists('/tmp/test.txt');
        $this->assertTestFileNotExists('/tmp/deleted.txt');

        // Assert file contents
        $this->assertFileContains('/tmp/test.txt', 'Hello World');
        $this->assertFileNotContains('/tmp/test.txt', 'Goodbye');

        // Directory assertions
        $this->assertTestDirectoryExists('/tmp/test_dir');
        $this->assertDirectoryEmpty('/tmp/empty_dir');
        $this->assertDirectoryContainsFile('/tmp/test_dir', 'file.txt');

        // Get file properties
        $content = $this->getFileContent('/tmp/test.txt');
        $size = $this->getFileSize('/tmp/test.txt');

        $this->assertEquals('Hello World', $content);
        $this->assertGreaterThan(0, $size);
    }

    public function testFileUploads(): void
    {
        // Create a test file for upload
        $tempFile = $this->createTempFile('test content', 'txt');

        $response = $this->post('/api/upload', [], ['file' => $tempFile]);

        $this->assertEquals(200, $response->getStatusCode());
    }
}`
				)
			]),

			// Test Data and Fixtures
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Data and Fixtures"),
				P(
					{ class: "text-muted-foreground" },
					`Comprehensive test data management with fake data generation and fixture loading:`
				),
				CodeBlock(
`class TestDataTest extends Test
{
    public function testTestDataManagement(): void
    {
        // Set test data
        $this->setTestData('api_key', 'test-key-123');
        $this->withTestData([
            'environment' => 'testing',
            'debug' => true
        ]);

        // Get test data
        $apiKey = $this->getTestData('api_key');
        $debug = $this->getTestData('debug', false); // with default

        $this->assertEquals('test-key-123', $apiKey);
        $this->assertTrue($debug);
    }

    public function testFakeDataGeneration(): void
    {
        $faker = $this->fake();

        // Generate fake data
        $name = $faker->name();
        $email = $faker->email();
        $phone = $faker->phoneNumber();
        $address = $faker->address();
        $text = $faker->text(50); // 50 words
        $number = $faker->numberBetween(1, 100);
        $date = $faker->dateTimeBetween('-1 year', 'now');
        $uuid = $faker->uuid();

        // Use in model creation
        $user = $this->createModel(User::class, [
            'name' => $name,
            'email' => $email,
            'phone' => $phone
        ]);

        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->email);
        $this->assertNotEmpty($user->phone);
    }

    public function testLoadingFixtures(): void
    {
        // Load fixture data (supports JSON, PHP, YAML)
        $userData = $this->loadFixture('users.json');
        $config = $this->loadFixture('config.php');

        // Create temporary files
        $tempFile = $this->createTempFile('test content', 'txt');
        $tempDir = $this->createTempDirectory();

        $this->assertIsArray($userData);
        $this->assertFileExists($tempFile);
        $this->assertDirectoryExists($tempDir);
    }
}`
				)
			]),

			// Enhanced Assertions
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Enhanced Assertions"),
				P(
					{ class: "text-muted-foreground" },
					`Additional assertion methods for common testing scenarios:`
				),
				CodeBlock(
`class EnhancedAssertionsTest extends Test
{
    public function testCollectionAssertions(): void
    {
        $collection = [1, 2, 3, 4, 5];

        $this->assertCollectionContains(3, $collection);
        $this->assertCollectionCount(5, $collection);
        $this->assertCollectionEmpty([]);
        $this->assertCollectionNotEmpty($collection);
    }

    public function testArrayAssertions(): void
    {
        $array = ['name' => 'John', 'age' => 30, 'city' => 'NYC'];

        $this->assertArrayHasKeys(['name', 'age'], $array);
        $this->assertArrayMissingKeys(['password', 'secret'], $array);
    }

    public function testStringAssertions(): void
    {
        $phoneNumber = '555-123-4567';
        $text = 'hello beautiful world';

        $this->assertStringMatchesPattern('/^\\d{3}-\\d{3}-\\d{4}$/', $phoneNumber);
        $this->assertStringContainsAll(['hello', 'world'], $text);
    }

    public function testValidationAssertions(): void
    {
        $this->assertValidEmail('test@example.com');
        $this->assertValidUrl('https://example.com');
        $this->assertBetween(10, 20, 15);
        $this->assertRecentTimestamp(time());
        $this->assertRecentDate('2025-09-04 10:30:00');
    }
}`
				)
			]),

			// Test Configuration and Setup
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Configuration and Setup"),
				P(
					{ class: "text-muted-foreground" },
					`Configure your test environment and customize test behavior:`
				),
				CodeBlock(
`class MyTest extends Test
{
    // Disable database transactions for specific tests
    protected bool $useTransactions = false;

    // Set seeders to run before each test
    protected array $seeders = [
        UserSeeder::class,
        ProductSeeder::class
    ];

    protected function setUp(): void
    {
        parent::setUp();

        // Custom setup logic
        $this->withTestData(['custom_config' => true]);

        // Set up additional test state
        $this->setTestEnvironment();
    }

    protected function tearDown(): void
    {
        // Custom cleanup logic
        $this->cleanupTestResources();

        parent::tearDown();
    }

    private function setTestEnvironment(): void
    {
        // Configure test-specific settings
        $this->setTestData('environment', 'testing');
    }

    private function cleanupTestResources(): void
    {
        // Clean up any custom resources
    }
}`
				)
			]),

			// PHPUnit Configuration
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "PHPUnit Configuration"),
				P(
					{ class: "text-muted-foreground" },
					`The testing system integrates with your existing phpunit.xml configuration:`
				),
				CodeBlock(
`<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="./vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./modules/*/Tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./modules/*/Tests/Feature</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory suffix="Test.php">./modules/*/Tests/Integration</directory>
        </testsuite>
    </testsuites>

    <php>
        <server name="APP_ENV" value="testing"/>
        <server name="DB_CONNECTION" value="testing"/>
    </php>

    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./modules</directory>
            <directory suffix=".php">./common</directory>
        </include>
        <exclude>
            <directory suffix=".php">./modules/*/Tests</directory>
        </exclude>
    </coverage>
</phpunit>`
				)
			]),

			// Running Tests
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Running Tests"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides several ways to run your comprehensive test suite:`
				),
				CodeBlock(
`# Run all tests
php vendor/bin/phpunit

# Run tests by test suite
php vendor/bin/phpunit --testsuite Unit
php vendor/bin/phpunit --testsuite Feature
php vendor/bin/phpunit --testsuite Integration

# Run tests in a specific directory
php vendor/bin/phpunit modules/User/Tests/

# Run a specific test file
php vendor/bin/phpunit modules/User/Tests/Unit/UserModelTest.php

# Run a specific test method
php vendor/bin/phpunit --filter testUserCanBeCreatedWithValidData

# Run tests with coverage report
php vendor/bin/phpunit --coverage-html coverage/
php vendor/bin/phpunit --coverage-text

# Run tests in parallel (faster execution)
php vendor/bin/phpunit --parallel

# Generate detailed test reports
php vendor/bin/phpunit --log-junit results.xml
php vendor/bin/phpunit --testdox`
				)
			]),

			// Complete Example Test
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Complete Example Test"),
				P(
					{ class: "text-muted-foreground" },
					`Here's a comprehensive example showing all the testing features in action:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Tests\\Unit;

use Proto\\Tests\\Test;
use Modules\\User\\Models\\User;
use Modules\\User\\Services\\UserService;

class UserServiceTest extends Test
{
    // Run seeders before each test
    protected array $seeders = [RoleSeeder::class];

    public function testCreatesUserWithValidData(): void
    {
        // Arrange - Use fake data for realistic testing
        $userData = [
            'name' => $this->fake()->name(),
            'email' => $this->fake()->unique()->email(),
            'phone' => $this->fake()->phoneNumber(),
            'role_id' => 1 // From seeder
        ];

        // Mock external service
        $emailService = $this->mockService(EmailService::class);
        $this->expectMethodCall($emailService, 'sendWelcome', [$userData['email']]);

        $service = new UserService();

        // Act
        $user = $service->create($userData);

        // Assert - Use enhanced assertions
        $this->assertInstanceOf(User::class, $user);
        $this->assertModelExists($user);
        $this->assertModelHasAttributes($user, [
            'name' => $userData['name'],
            'email' => $userData['email']
        ]);

        // Database assertions
        $this->assertDatabaseHas('users', [
            'email' => $userData['email']
        ]);
        $this->assertDatabaseCount('users', 1);

        // Validation assertions
        $this->assertValidEmail($user->email);
        $this->assertRecentTimestamp($user->created_at);
    }

    public function testThrowsExceptionWithInvalidEmail(): void
    {
        // Arrange
        $userData = [
            'name' => 'John Doe',
            'email' => 'invalid-email-format'
        ];
        $service = new UserService();

        // Act & Assert
        $this->expectException(ValidationException::class);
        $service->create($userData);

        // Ensure no database changes
        $this->assertDatabaseCount('users', 0);
    }

    public function testApiEndpointReturnsUserData(): void
    {
        // Arrange
        $user = $this->createModel(User::class, [
            'name' => 'API Test User',
            'email' => 'api@example.com'
        ]);

        // Act - Test API endpoint
        $response = $this->actingAs($user)->getJson("/api/users/{$user->id}");

        // Assert - HTTP response
        $response->assertSuccessful();
        $response->assertJsonStructure([
            'id', 'name', 'email', 'created_at', 'updated_at'
        ]);
        $response->assertJson([
            'name' => 'API Test User',
            'email' => 'api@example.com'
        ]);
        $response->assertJsonMissing(['password']);
    }

    public function testFileUploadFunctionality(): void
    {
        // Arrange
        $user = $this->createModel(User::class);
        $testFile = $this->createTempFile('profile image content', 'jpg');

        // Act
        $response = $this->actingAs($user)
            ->post('/api/users/avatar', [], ['avatar' => $testFile]);

        // Assert
        $response->assertSuccessful();
        $this->assertFileContains($user->getAvatarPath(), 'profile image content');
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Set test environment data
        $this->withTestData([
            'upload_path' => '/tmp/test_uploads',
            'max_file_size' => '5MB'
        ]);
    }
}`
				)
			]),

			// Best Practices
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Testing Best Practices"),
				P(
					{ class: "text-muted-foreground" },
					`Follow these best practices for effective testing in Proto:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Use descriptive test names** that explain behavior being tested"),
					Li("**Arrange, Act, Assert** - structure tests with clear setup, execution, and verification"),
					Li("**Use database transactions** for automatic test isolation and cleanup"),
					Li("**Mock external dependencies** to keep tests fast, reliable, and focused"),
					Li("**Leverage fake data** instead of hardcoded values for more realistic testing"),
					Li("**Test both happy and error paths** to ensure robust error handling"),
					Li("**Keep tests focused** - each test should verify a single behavior"),
					Li("**Use model factories** and fixtures for maintainable test data"),
					Li("**Test at the right level** - unit tests for logic, feature tests for workflows"),
					Li("**Utilize enhanced assertions** for more expressive and clear test expectations"),
					Li("**Take advantage of seeders** for consistent test database state"),
					Li("**Clean up resources properly** - the framework handles this automatically")
				])
			])
		]
	);

export default TestsPage;

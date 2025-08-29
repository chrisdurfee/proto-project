import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../doc-page.js";

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
 * This page explains how Proto uses PHPUnit for testing.
 * It covers naming conventions for tests, setup and teardown methods, and guidelines for naming test methods.
 *
 * @returns {DocPage}
 */
export const TestsPage = () =>
	DocPage(
		{
			title: 'Tests',
			description: 'Learn how to write tests in Proto using the PHPUnit library.'
		},
		[
			// Overview
			Section({ class: "flex flex-col gap-y-4" }, [
				H4({ class: "text-lg font-bold" }, "Overview"),
				P(
					{ class: "text-muted-foreground" },
					`Proto uses the PHPUnit library to perform comprehensive testing including unit tests,
					integration tests, and feature tests. The testing framework provides utilities for
					testing API endpoints, database interactions, email dispatching, and more. Proto's
					testing foundation ensures your application remains reliable and maintainable.`
				)
			]),

			// Test Structure and Organization
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Structure and Organization"),
				P(
					{ class: "text-muted-foreground" },
					`Tests are organized in module-specific test directories following these conventions:`
				),
				CodeBlock(
`modules/
  Example/
    Tests/
      Unit/          # Unit tests for individual classes/methods
        ModelTest.php
        ServiceTest.php
      Feature/       # Feature tests for complete functionality
        UserRegistrationTest.php
        OrderProcessingTest.php
      Integration/   # Integration tests for external services
        PaymentGatewayTest.php
        EmailServiceTest.php
    Controllers/
    Models/
    Services/`
				)
			]),

			// Test Types
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Types"),
				P(
					{ class: "text-muted-foreground" },
					`Proto supports three primary types of tests:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Unit Tests**: Test individual methods and classes in isolation"),
					Li("**Feature Tests**: Test complete user workflows and API endpoints"),
					Li("**Integration Tests**: Test interactions with external services and databases")
				])
			]),

			// Naming
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Naming"),
				P(
					{ class: "text-muted-foreground" },
					`The name of a test should always be singular and end with "Test". For example:`
				),
				CodeBlock(
`<?php
declare(strict_types=1);
namespace Module\\User\\Tests\\Unit;

use Proto\\Tests\\Test;

class ExampleTest extends Test
{
    protected function setUp(): void
    {
        // Setup code before each test
		parent::setUp();
    }

    protected function tearDown(): void
    {
        // Cleanup code after each test
		parent::tearDown();
    }
}`
				)
			]),

			// Set-Up
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Set-Up"),
				P(
					{ class: "text-muted-foreground" },
					`The setUp() method is called before each test is run.
                    Use it to initialize any resources or state required for your tests.`
				),
				CodeBlock(
`protected function setUp(): void
{
    // Execute code to set up the test environment
	parent::setUp();
}`
				)
			]),

			// Tear-Down
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Tear-Down"),
				P(
					{ class: "text-muted-foreground" },
					`The tearDown() method is called after each test completes.
                    Use it to clean up any resources or reset state.`
				),
				CodeBlock(
`protected function tearDown(): void
{
    // Execute code to clean up after tests
	parent::tearDown();
}`
				)
			]),

			// Test Method Names
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Method Names"),
				P(
					{ class: "text-muted-foreground" },
					`Test method names should begin with "test" followed by the action being tested.
					Use descriptive names that clearly explain what is being tested:`
				),
				CodeBlock(
`public function testUserCanBeCreatedWithValidData(): void
{
    $userData = [
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ];

    $user = User::create($userData);

    $this->assertInstanceOf(User::class, $user);
    $this->assertEquals('John Doe', $user->name);
}

public function testApiReturnsErrorForInvalidInput(): void
{
    $response = $this->post('/api/users', []);

    $this->assertEquals(422, $response->getStatusCode());
}

public function testEmailIsDispatchedWhenUserRegisters(): void
{
    // Test implementation
}`
				)
			]),

			// Database Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Database Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides utilities for testing database interactions including
					model operations, migrations, and data integrity:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

class UserModelTest extends Test
{
    protected function setUp(): void
    {
        parent::setUp();

        // Create test database tables
        $this->createTestTables();

        // Seed test data
        $this->seedTestData();
    }

    public function testUserCanBeCreated(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secure123'
        ];

        $user = User::create($userData);

        $this->assertNotNull($user->id);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);

        // Verify database record exists
        $dbUser = User::get($user->id);
        $this->assertEquals($user->id, $dbUser->id);
    }

    public function testUserValidationRules(): void
    {
        // Test required fields
        $this->expectException(ValidationException::class);
        User::create(['name' => '']); // Should fail validation
    }

    public function testUserPasswordIsHashed(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'plaintext'
        ]);

        $this->assertNotEquals('plaintext', $user->password);
        $this->assertTrue(password_verify('plaintext', $user->password));
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $this->cleanupTestData();
        parent::tearDown();
    }
}`
				)
			]),

			// API Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "API Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Test your API endpoints thoroughly including authentication, authorization,
					input validation, and response formats:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

class UserApiTest extends Test
{
    public function testGetUsersEndpoint(): void
    {
        // Create test users
        $user1 = User::create(['name' => 'User 1', 'email' => 'user1@test.com']);
        $user2 = User::create(['name' => 'User 2', 'email' => 'user2@test.com']);

        $response = $this->get('/api/users');

        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getBody(), true);
        $this->assertIsArray($data);
        $this->assertCount(2, $data);
    }

    public function testCreateUserEndpoint(): void
    {
        $userData = [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'secure123'
        ];

        $response = $this->post('/api/users', $userData);

        $this->assertEquals(201, $response->getStatusCode());

        $responseData = json_decode($response->getBody(), true);
        $this->assertEquals('New User', $responseData['name']);
        $this->assertEquals('new@example.com', $responseData['email']);
        $this->assertArrayNotHasKey('password', $responseData); // Should be hidden
    }

    public function testUpdateUserRequiresAuthentication(): void
    {
        $user = User::create(['name' => 'Test', 'email' => 'test@test.com']);

        $response = $this->put("/api/users/{$user->id}", [
            'name' => 'Updated Name'
        ]);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function testAuthenticatedUserCanUpdateProfile(): void
    {
        $user = User::create(['name' => 'Test', 'email' => 'test@test.com']);

        // Authenticate user
        $this->actingAs($user);

        $response = $this->put("/api/users/{$user->id}", [
            'name' => 'Updated Name'
        ]);

        $this->assertEquals(200, $response->getStatusCode());

        // Verify update
        $updatedUser = User::get($user->id);
        $this->assertEquals('Updated Name', $updatedUser->name);
    }

    public function testValidationErrorsAreReturned(): void
    {
        $response = $this->post('/api/users', [
            'name' => '', // Invalid
            'email' => 'invalid-email' // Invalid
        ]);

        $this->assertEquals(422, $response->getStatusCode());

        $errors = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('name', $errors);
        $this->assertArrayHasKey('email', $errors);
    }
}`
				)
			]),

			// Testing Utilities and Helpers
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Testing Utilities and Helpers"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides testing utilities to simplify common testing scenarios:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

class TestHelpers extends Test
{
    /**
     * HTTP Testing Methods
     */
    public function testHttpMethods(): void
    {
        // GET request
        $response = $this->get('/api/endpoint');

        // POST request with data
        $response = $this->post('/api/endpoint', ['key' => 'value']);

        // PUT request
        $response = $this->put('/api/endpoint/1', ['updated' => 'value']);

        // DELETE request
        $response = $this->delete('/api/endpoint/1');

        // Custom headers
        $response = $this->get('/api/endpoint', [
            'Authorization' => 'Bearer token',
            'Content-Type' => 'application/json'
        ]);
    }

    /**
     * Authentication Testing
     */
    public function testAuthentication(): void
    {
        $user = User::create(['name' => 'Test', 'email' => 'test@test.com']);

        // Act as authenticated user
        $this->actingAs($user);

        $response = $this->get('/api/protected-endpoint');
        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * Database Assertions
     */
    public function testDatabaseAssertions(): void
    {
        $user = User::create(['name' => 'Test', 'email' => 'test@test.com']);

        // Assert record exists in database
        $this->assertDatabaseHas('users', [
            'email' => 'test@test.com'
        ]);

        $user->delete();

        // Assert record was deleted
        $this->assertDatabaseMissing('users', [
            'email' => 'test@test.com'
        ]);
    }

    /**
     * File Upload Testing
     */
    public function testFileUploads(): void
    {
        $file = $this->createTestFile('test.txt', 'Test content');

        $response = $this->post('/api/upload', [], ['file' => $file]);

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * Email Testing
     */
    public function testEmailDispatching(): void
    {
        // Clear any previous emails
        $this->clearDispatchedEmails();

        // Trigger action that sends email
        User::create(['name' => 'Test', 'email' => 'test@test.com']);

        // Assert email was dispatched
        $this->assertEmailSent('test@test.com', 'Welcome Subject');

        // Get dispatched emails
        $emails = $this->getDispatchedEmails();
        $this->assertCount(1, $emails);
    }
}`
				)
			]),

			// Test Data Management
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Data Management"),
				P(
					{ class: "text-muted-foreground" },
					`Manage test data effectively with factories, fixtures, and cleanup strategies:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

class TestDataManagement extends Test
{
    /**
     * Using Model Factories
     */
    public function testWithFactories(): void
    {
        // Create single user
        $user = $this->createUser();

        // Create user with specific attributes
        $user = $this->createUser([
            'name' => 'Specific Name',
            'email' => 'specific@test.com'
        ]);

        // Create multiple users
        $users = $this->createUsers(5);

        $this->assertCount(5, $users);
    }

    /**
     * Database Transactions for Isolation
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Start database transaction
        $this->beginDatabaseTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback transaction (cleans up all test data)
        $this->rollbackDatabaseTransaction();

        parent::tearDown();
    }

    /**
     * Seeding Test Data
     */
    public function testWithSeededData(): void
    {
        // Seed specific test data
        $this->seed([
            'users' => [
                ['name' => 'Admin', 'email' => 'admin@test.com', 'role' => 'admin'],
                ['name' => 'User', 'email' => 'user@test.com', 'role' => 'user']
            ],
            'posts' => [
                ['title' => 'Test Post', 'user_id' => 1, 'content' => 'Content']
            ]
        ]);

        $adminUser = User::where('role', 'admin')->first();
        $this->assertEquals('Admin', $adminUser->name);
    }

    /**
     * Helper Methods for Test Data
     */
    protected function createUser(array $attributes = []): User
    {
        $defaults = [
            'name' => 'Test User',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password123'
        ];

        return User::create(array_merge($defaults, $attributes));
    }

    protected function createUsers(int $count): array
    {
        $users = [];
        for ($i = 0; $i < $count; $i++) {
            $users[] = $this->createUser([
                'email' => "test{$i}@example.com"
            ]);
        }
        return $users;
    }
}`
				)
			]),

			// Performance and Load Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Performance and Load Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Test performance characteristics and ensure your application can handle expected load:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

class PerformanceTest extends Test
{
    public function testApiResponseTime(): void
    {
        $startTime = microtime(true);

        $response = $this->get('/api/users');

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertLessThan(100, $responseTime, 'API response took too long');
    }

    public function testDatabaseQueryPerformance(): void
    {
        // Create test data
        $this->createUsers(1000);

        $startTime = microtime(true);

        // Test query performance
        $users = User::where('status', 'active')->limit(10)->get();

        $endTime = microtime(true);
        $queryTime = ($endTime - $startTime) * 1000;

        $this->assertLessThan(50, $queryTime, 'Database query took too long');
    }

    public function testMemoryUsage(): void
    {
        $initialMemory = memory_get_usage();

        // Perform memory-intensive operation
        $this->createUsers(500);

        $finalMemory = memory_get_usage();
        $memoryUsed = $finalMemory - $initialMemory;

        // Assert memory usage is within acceptable limits (e.g., 10MB)
        $this->assertLessThan(10 * 1024 * 1024, $memoryUsed, 'Memory usage too high');
    }
}`
				)
			]),

			// Running Tests
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Running Tests"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides several ways to run your tests:`
				),
				CodeBlock(
`# Run all tests
php vendor/bin/phpunit

# Run tests in a specific directory
php vendor/bin/phpunit modules/User/Tests/

# Run a specific test file
php vendor/bin/phpunit modules/User/Tests/Unit/UserModelTest.php

# Run a specific test method
php vendor/bin/phpunit --filter testUserCanBeCreated

# Run tests with coverage report
php vendor/bin/phpunit --coverage-html coverage/

# Run tests in parallel (if configured)
php vendor/bin/phpunit --parallel

# Generate test report
php vendor/bin/phpunit --log-junit results.xml`
				)
			]),

			// Test Configuration
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test Configuration"),
				P(
					{ class: "text-muted-foreground" },
					`Configure PHPUnit through the phpunit.xml file in your project root.
					Proto provides sensible defaults but you can customize as needed:`
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

			// Best Practices
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Testing Best Practices"),
				P(
					{ class: "text-muted-foreground" },
					`Follow these best practices for effective testing in Proto:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Test one thing at a time**: Each test should verify a single behavior"),
					Li("**Use descriptive test names**: Make it clear what is being tested"),
					Li("**Arrange, Act, Assert**: Structure tests with clear setup, execution, and verification"),
					Li("**Use database transactions**: Ensure test isolation and fast cleanup"),
					Li("**Mock external services**: Don't rely on external APIs or services in tests"),
					Li("**Test edge cases**: Include tests for error conditions and boundary values"),
					Li("**Keep tests fast**: Aim for tests that run in milliseconds, not seconds"),
					Li("**Test behavior, not implementation**: Focus on what the code does, not how it does it"),
					Li("**Use factories for test data**: Create reusable, maintainable test data"),
					Li("**Test at the right level**: Use unit tests for logic, integration tests for workflows")
				])
			])
		]
	);

export default TestsPage;

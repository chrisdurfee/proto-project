# Quick Test Implementation Guide

## 🚀 Getting Started

### 1. Create Your First Test (5 minutes)

```bash
# Create test file
touch modules/Auth/Tests/Feature/LoginTest.php
```

```php
<?php declare(strict_types=1);
namespace Modules\Auth\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\User;

class LoginTest extends Test
{
    /**
     * Test successful login returns token
     */
    public function testSuccessfulLoginReturnsToken(): void
    {
        // Arrange: Create a test user
        $user = $this->createTestUser();

        // Act: Attempt login
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->email,
            'password' => 'password123'
        ]);

        // Assert: Check response
        $this->assertEquals(200, $response->status);
        $this->assertNotEmpty($response->data->token);
        $this->assertEquals($user->id, $response->data->user->id);
    }

    /**
     * Helper to create test user
     */
    private function createTestUser(): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'enabled' => 1
        ]);
    }
}
```

### 2. Run Your Test

```bash
# From project root
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit modules/Auth/Tests/Feature/LoginTest.php
```

---

## 📋 Test Template Library

### HTTP API Test Template

```php
<?php declare(strict_types=1);
namespace Modules\[MODULE]\Tests\Feature;

use Proto\Tests\Test;

class [FEATURE]Test extends Test
{
    protected function setUp(): void
    {
        parent::setUp();
        // Setup code here
    }

    public function test[Feature][Scenario](): void
    {
        // Arrange
        $data = [/* test data */];

        // Act
        $response = $this->postJson('/api/[endpoint]', $data);

        // Assert
        $response->assertStatus(200);
        $response->assertJson(['key' => 'value']);
    }

    protected function tearDown(): void
    {
        // Cleanup code here
        parent::tearDown();
    }
}
```

### Unit Test Template

```php
<?php declare(strict_types=1);
namespace Modules\[MODULE]\Tests\Unit;

use Proto\Tests\Test;

class [CLASS]Test extends Test
{
    public function test[Method][Scenario](): void
    {
        // Arrange
        $instance = new [CLASS]();

        // Act
        $result = $instance->[method]([params]);

        // Assert
        $this->assertEquals([expected], $result);
        $this->assertTrue([condition]);
        $this->assertNotNull($result);
    }
}
```

### Test with Seeders

```php
<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Seeders\RoleSeeder;

class UserTest extends Test
{
    // Seeders run before each test
    protected array $seeders = [RoleSeeder::class];

    public function testUserHasRoles(): void
    {
        $user = User::create([/* ... */]);

        // Roles from seeder are available
        $adminRole = Role::where('slug', 'admin')->first();
        $user->roles()->attach($adminRole->id);

        $this->assertTrue($user->hasRole('admin'));
    }
}
```

### Test with Mocks

```php
<?php declare(strict_types=1);
namespace Modules\User\Tests\Unit;

use Proto\Tests\Test;
use Common\Services\EmailService;

class UserServiceTest extends Test
{
    public function testUserCreationSendsEmail(): void
    {
        // Mock the email service
        $emailService = $this->mockService(EmailService::class);
        $this->expectMethodCall($emailService, 'sendWelcome', ['test@example.com']);

        // Test code that triggers email
        $userService = new UserService($emailService);
        $user = $userService->create([
            'email' => 'test@example.com',
            // ...
        ]);

        $this->assertNotNull($user);
    }
}
```

---

## 🎯 Common Test Assertions

### Response Assertions

```php
// Status codes
$response->assertStatus(200);
$response->assertStatus(201); // Created
$response->assertStatus(400); // Bad Request
$response->assertStatus(401); // Unauthorized
$response->assertStatus(403); // Forbidden
$response->assertStatus(404); // Not Found
$response->assertStatus(429); // Too Many Requests

// JSON structure
$response->assertJsonStructure([
    'data' => [
        'id',
        'name',
        'email'
    ]
]);

// JSON content
$response->assertJson(['success' => true]);
$response->assertJsonPath('data.id', 1);

// Headers
$response->assertHeader('Content-Type', 'application/json');
```

### Data Assertions

```php
// Equality
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual); // Strict comparison

// Truthiness
$this->assertTrue($condition);
$this->assertFalse($condition);

// Null checks
$this->assertNull($value);
$this->assertNotNull($value);

// Empty checks
$this->assertEmpty($array);
$this->assertNotEmpty($array);

// String assertions
$this->assertStringContains('needle', $haystack);
$this->assertStringStartsWith('prefix', $string);

// Array assertions
$this->assertCount(5, $array);
$this->assertContains('value', $array);
$this->assertArrayHasKey('key', $array);

// Type assertions
$this->assertIsString($value);
$this->assertIsInt($value);
$this->assertIsArray($value);
$this->assertInstanceOf(User::class, $user);
```

### Database Assertions

```php
// Record exists
$this->assertDatabaseHas('users', ['email' => 'test@example.com']);

// Record doesn't exist
$this->assertDatabaseMissing('users', ['email' => 'deleted@example.com']);

// Count records
$this->assertDatabaseCount('users', 10);

// Soft deletes
$this->assertSoftDeleted('users', ['id' => 1]);
```

---

## 🔧 Test Helpers & Utilities

### Faker (Test Data Generation)

```php
// In any test
$name = $this->fake()->name();
$email = $this->fake()->unique()->email();
$phone = $this->fake()->phoneNumber();
$text = $this->fake()->paragraph();
$date = $this->fake()->dateTimeBetween('-1 year', 'now');
$number = $this->fake()->numberBetween(1, 100);
$boolean = $this->fake()->boolean();
$address = $this->fake()->address();
$company = $this->fake()->company();
```

### HTTP Test Helpers

```php
// GET request
$response = $this->get('/api/users');
$response = $this->getJson('/api/users');

// POST request
$response = $this->post('/api/users', ['name' => 'John']);
$response = $this->postJson('/api/users', ['name' => 'John']);

// PUT request
$response = $this->put('/api/users/1', ['name' => 'Jane']);
$response = $this->putJson('/api/users/1', ['name' => 'Jane']);

// PATCH request
$response = $this->patch('/api/users/1', ['status' => 'active']);
$response = $this->patchJson('/api/users/1', ['status' => 'active']);

// DELETE request
$response = $this->delete('/api/users/1');
$response = $this->deleteJson('/api/users/1');

// With headers
$response = $this->withHeaders([
    'Authorization' => 'Bearer ' . $token,
    'X-Custom-Header' => 'value'
])->getJson('/api/users');

// With authentication
$response = $this->actingAs($user)->getJson('/api/profile');
```

### Time Travel (for testing time-based logic)

```php
// Freeze time
$this->freezeTime();

// Travel forward
$this->travelTo('+1 hour');
$this->travelTo('+1 day');

// Travel to specific time
$this->travelTo('2025-10-06 12:00:00');

// Return to present
$this->unfreezeTime();
```

---

## 📊 Testing Patterns by Scenario

### Testing Authentication

```php
public function testLoginWithValidCredentials(): void
{
    $user = User::factory()->create([
        'email' => 'user@example.com',
        'password' => password_hash('password', PASSWORD_BCRYPT)
    ]);

    $response = $this->postJson('/api/auth/login', [
        'username' => 'user@example.com',
        'password' => 'password'
    ]);

    $response->assertStatus(200);
    $this->assertNotNull($response->data->token);
}

public function testLoginFailsWithInvalidPassword(): void
{
    $user = User::factory()->create();

    $response = $this->postJson('/api/auth/login', [
        'username' => $user->email,
        'password' => 'wrong-password'
    ]);

    $response->assertStatus(401);
}

public function testLoginRateLimiting(): void
{
    $user = User::factory()->create();

    // Attempt login 11 times (max is 10)
    for ($i = 0; $i < 11; $i++) {
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->email,
            'password' => 'wrong'
        ]);
    }

    $response->assertStatus(429); // Too Many Requests
}
```

### Testing CRUD Operations

```php
public function testCreateUser(): void
{
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'secure123'
    ];

    $response = $this->postJson('/api/users', $data);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
}

public function testListUsersWithPagination(): void
{
    User::factory()->count(25)->create();

    $response = $this->getJson('/api/users?page=2&limit=10');

    $response->assertStatus(200);
    $this->assertCount(10, $response->data->items);
    $this->assertEquals(25, $response->data->total);
}

public function testUpdateUser(): void
{
    $user = User::factory()->create();

    $response = $this->putJson("/api/users/{$user->id}", [
        'name' => 'Updated Name'
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name'
    ]);
}

public function testDeleteUser(): void
{
    $user = User::factory()->create();

    $response = $this->deleteJson("/api/users/{$user->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
}
```

### Testing Validation

```php
public function testValidationFailsWithMissingFields(): void
{
    $response = $this->postJson('/api/users', [
        'name' => 'John' // Missing email
    ]);

    $response->assertStatus(422); // Unprocessable Entity
    $response->assertJsonValidationErrors(['email']);
}

public function testValidationFailsWithInvalidEmail(): void
{
    $response = $this->postJson('/api/users', [
        'name' => 'John',
        'email' => 'not-an-email'
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
}

public function testValidationEnforcesUniqueness(): void
{
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->postJson('/api/users', [
        'name' => 'John',
        'email' => 'existing@example.com'
    ]);

    $response->assertStatus(422);
}
```

### Testing Permissions

```php
public function testUserCanAccessOwnProfile(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson("/api/users/{$user->id}");

    $response->assertStatus(200);
}

public function testUserCannotAccessOtherProfile(): void
{
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $response = $this->actingAs($user1)->getJson("/api/users/{$user2->id}");

    $response->assertStatus(403); // Forbidden
}

public function testAdminCanAccessAnyProfile(): void
{
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->getJson("/api/users/{$user->id}");

    $response->assertStatus(200);
}
```

### Testing Relationships

```php
public function testUserHasRoles(): void
{
    $user = User::factory()->create();
    $role = Role::factory()->create();

    $user->roles()->attach($role->id);

    $this->assertTrue($user->roles->contains($role));
    $this->assertCount(1, $user->roles);
}

public function testUserHasManyPosts(): void
{
    $user = User::factory()->create();
    Post::factory()->count(3)->create(['user_id' => $user->id]);

    $this->assertCount(3, $user->posts);
    $this->assertInstanceOf(Post::class, $user->posts->first());
}
```

### Testing Email Sending

```php
public function testWelcomeEmailSentOnRegistration(): void
{
    // Mock email service
    $emailService = $this->mockService(EmailService::class);
    $this->expectMethodCall($emailService, 'sendWelcome');

    $response = $this->postJson('/api/auth/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'secure123'
    ]);

    $response->assertStatus(201);
}
```

---

## 🐛 Debugging Failed Tests

### Enable Verbose Output

```bash
# Show all test output
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --verbose

# Show test names as they run
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --testdox
```

### Common Issues & Solutions

#### 1. Database Connection Errors
```
Error: SQLSTATE[HY000] [2002] Connection refused
```
**Solution**: Ensure database container is running
```bash
docker-compose -f infrastructure/docker-compose.yaml ps
docker-compose -f infrastructure/docker-compose.yaml up -d mariadb
```

#### 2. Autoload Errors
```
Error: Class 'Modules\User\Models\User' not found
```
**Solution**: Regenerate autoload
```bash
docker-compose -f infrastructure/docker-compose.yaml exec web composer dump-autoload
```

#### 3. Permission Errors
```
Error: Unable to write to /var/www/html/storage
```
**Solution**: Fix permissions
```bash
docker-compose -f infrastructure/docker-compose.yaml exec web chmod -R 777 storage/
```

#### 4. Test Isolation Issues
**Problem**: Tests pass individually but fail together
**Solution**: Ensure proper cleanup in `tearDown()`
```php
protected function tearDown(): void
{
    // Clear any static state
    User::clearBootedModels();

    // Rollback transactions
    DB::rollBack();

    parent::tearDown();
}
```

---

## 📚 Next Steps

1. **Read the full proposal**: `infrastructure/docs/TEST-COVERAGE-PROPOSAL.md`
2. **Set up test database**: Configure separate test DB in `phpunit.xml`
3. **Start with P0 tests**: Begin with Authentication tests (highest priority)
4. **Run tests frequently**: Add to your development workflow
5. **Add CI/CD**: Automate testing on every commit

---

## 🆘 Need Help?

- **Proto Framework Testing Docs**: `apps/developer` → Documentation → Tests
- **PHPUnit Manual**: https://phpunit.de/documentation.html
- **Proto Tests Base Class**: Check `Proto\Tests\Test` for available methods
- **Existing Tests**: See `modules/User/Tests/Unit/` for examples

---

**Happy Testing! 🎉**

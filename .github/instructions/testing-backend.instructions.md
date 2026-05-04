---
description: "Use when writing PHP tests, factories, or seeders — covers PHPUnit-based test structure, Proto factories with SimpleFaker (METHOD call $this->faker()), seeder patterns, database assertions, transaction handling, idempotency scoping, table name vs class name pitfalls, eager join testing pitfalls and helpers (safeGet, refreshModelWithoutJoins), camelCase field naming"
applyTo: "{modules/**/Tests/**/*.php,common/**/Tests/**/*.php,modules/**/Factories/*.php,modules/**/Seeders/*.php}"
---

# Testing (Backend)

## Test Structure

```php
<?php declare(strict_types=1);
namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\User;

class UserTest extends Test
{
    public function testCreateUser(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'test@example.com'
        ]);
    }
}
```

## Factories

```php
User::factory()->create();                              // Persisted
User::factory()->make();                                // Unpersisted
User::factory()->count(5)->create();                    // Bulk
User::factory()->create(['email' => 'x@y.com']);       // Custom attributes
User::factory()->admin()->create();                     // State variation
```

**CRITICAL**: `$this->faker()` is a METHOD call, not a property. `state()` requires a callable.

### Factory Structure
```php
<?php declare(strict_types=1);
namespace Modules\User\Factories;

use Proto\Models\Factory;
use Modules\User\Models\User;

class UserFactory extends Factory
{
    protected function model(): string
    {
        return User::class;
    }

    public function definition(): array
    {
        return [
            'username' => $this->faker()->username(),
            'email' => $this->faker()->email(),
            'password' => password_hash('password', PASSWORD_DEFAULT),
            'firstName' => $this->faker()->firstName(),
            'lastName' => $this->faker()->lastName()
        ];
    }

    public function admin(): static
    {
        return $this->state(fn() => ['role' => 'admin']);
    }
}
```

### SimpleFaker Available Methods
Proto SimpleFaker has LIMITED methods compared to FakerPHP. Check `protoframework\proto\src\Tests\SimpleFaker.php`.

**Basic**: `name()`, `firstName()`, `lastName()`, `username()`, `email()`, `safeEmail()`
**Address**: `streetAddress()`, `city()`, `state()`, `stateAbbr()`, `postcode()`, `address()`, `country()`, `countryCode()`
**Text**: `word()`, `words()`, `sentence()`, `paragraph()`, `paragraphs()`, `text()`, `realText()`
**Numbers**: `numberBetween()`, `floatBetween()`, `randomFloat()`, `randomDigit()`, `boolean()`
**Dates**: `dateTimeBetween()`, `date()`, `time()`, `dateTimeThisMonth()`, `dateTimeThisYear()`, `dateTimeThisDecade()`
**Utility**: `randomElement()`, `randomElements()`, `uuid()`, `url()`, `slug()`, `hexColor()`, `imageUrl()`, `optional()`, `unique()`
**Contact**: `phoneNumber()`, `company()`, `jobTitle()`
**Geo**: `latitude()`, `longitude()`

**Aliases**: `randomFloat(2, 10, 100)` = `floatBetween(10.0, 100.0, 2)`, `paragraphs(3, true)` = `paragraph(3)`, `dateTimeThisMonth()` = `dateTimeBetween('-1 month', 'now')`

### Enum Fields in Factories (CRITICAL)
Values MUST exactly match migration enum. Cross-reference the migration file.
```php
// Migration: $table->enum('category', 'events', 'community', 'automotive', 'lifestyle', 'performance', 'technology');
// ❌ WRONG: randomElement(['automotive', 'lifestyle', 'tech', 'culture'])
// ✅ CORRECT: randomElement(['automotive', 'lifestyle', 'events', 'community', 'performance', 'technology'])
```

### Model Factory Annotation
```php
use Modules\User\Models\Factories\UserFactory;

/**
 * @method static UserFactory factory(int $count = 1, array $attributes = [])
 */
class User extends Model
{
    protected static ?string $factory = UserFactory::class;
}
```

## Seeders

**Location**: `modules/*/Seeders` or `common/Seeders`

```php
<?php declare(strict_types=1);
namespace Modules\User\Seeders;

use Proto\Database\Seeders\Seeder;
use Modules\User\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->count(10)->create();
    }
}

// Run: php vendor/bin/phpunit --filter SeederTest
// Programmatic: SeederManager::run([UserSeeder::class, GroupSeeder::class]);
```

## Assertions
```php
$this->assertDatabaseHas('table', [...]);
$this->assertDatabaseMissing('table', [...]);
$this->assertDatabaseCount('table', 5);
$this->assertTrue($condition);
$this->assertEquals($expected, $actual);
$this->assertNotNull($value);
$this->assertIsArray($value);
$this->assertCount(3, $array);
```

## Test Transactions
- Tests auto-wrap in transactions and rollback automatically
- Connection caching ensures all operations share the same connection/transaction
- All model methods work correctly within test transactions
- Don't disable foreign key checks unless absolutely necessary

## Idempotency Tests (CRITICAL)
`assertDatabaseCount()` counts ALL rows globally. Always scope to the test user:
```php
// ❌ WRONG
$this->assertDatabaseCount('user_sessions', 1);

// ✅ CORRECT
$sessions = UserSession::fetchWhere(['userId' => $user->id]);
$this->assertCount(1, $sessions);
```

## Table Names (CRITICAL)
Always check `protected static ?string $tableName` in the model — shortened names may differ from class name:
```php
// Model: UserVehicleTypePreference, but $tableName = 'user_vtype_preferences'
$this->assertDatabaseHas('user_vtype_preferences', [...]);
```

## Models with Eager Joins

Models using `joins()` may return null when re-fetching within test transactions.

```php
// ✅ CORRECT - Use original object from factory
$booking = PartnerBooking::factory()->create(['confirmationCode' => 'ABC123']);
$this->assertEquals('ABC123', $booking->confirmationCode);

// ✅ CORRECT - Verify via database assertion
$this->assertDatabaseHas('partner_bookings', ['id' => $booking->id]);

// ✅ CORRECT - Use test helpers
$event = $this->safeGet(Event::class, $eventId);
$updated = $this->refreshModelWithoutJoins($event);

// ❌ WRONG - Re-fetching may return null with eager joins
$fetched = PartnerBooking::get($booking->id); // May be null!
```

### Test Helpers (ModelTestHelpers trait)
- `$this->safeGet(Model::class, $id)` — tries `get()`, falls back to `getWithoutJoins()`
- `$this->refreshModelWithoutJoins($model)` — re-fetches bypassing eager joins

### Update Methods for Joined Models
```php
// ✅ CORRECT - Query builder (works in tests)
public static function markResponded(int $leadId): bool
{
    return static::builder()
        ->update()
        ->set(['status' => 'contacted', 'responded_at' => date('Y-m-d H:i:s')])
        ->where('id = ?')
        ->execute([$leadId]);
}

// ❌ WRONG - Fetch-then-update fails in tests
$lead = static::get($leadId); // null in test!
```

## Field Naming
Always use camelCase in tests and assertions:
```php
$this->assertEquals('pending', $partner->verificationStatus); // NOT verification_status
$this->assertDatabaseHas('partners', ['verificationStatus' => 'pending']);
```

## Best Practices
- Every model should have a factory in `Models/Factories/`
- Every module should have at least one feature test in `Tests/Feature/`
- Remove all debug output (`echo`, `print`, `var_dump`) before committing
- Use returned factory object directly rather than re-fetching
- For idempotency tests, scope assertions to the test user

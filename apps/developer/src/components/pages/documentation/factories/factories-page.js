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
 * FactoriesPage
 *
 * This page explains the Proto factory system for generating test data.
 * It covers factory creation, usage patterns, states, and integration with tests.
 *
 * @returns {DocPage}
 */
export const FactoriesPage = () =>
	DocPage(
		{
			title: 'Factories',
			description: 'Generate test data easily with Proto\'s factory system for models and testing.'
		},
		[
			// Overview
			Section({ class: "flex flex-col gap-y-4" }, [
				H4({ class: "text-lg font-bold" }, "Overview"),
				P(
					{ class: "text-muted-foreground" },
					`Proto's factory system provides a powerful way to generate test data for your models.
					Factories define blueprints for creating model instances with realistic, random data using
					the Faker library. This makes it easy to populate databases for testing, seed development
					environments, or create fixture data.`
				)
			]),

			// Installation
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Creating a Factory"),
				P(
					{ class: "text-muted-foreground" },
					`To create a factory, extend the Proto\\Models\\Factory base class and implement
					the model() and definition() methods:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Models;

use Proto\\Models\\Factory;

class UserFactory extends Factory
{
    /**
     * The model this factory creates
     */
    protected function model(): string
    {
        return User::class;
    }

    /**
     * Define the model's default state
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker()->name(),
            'email' => $this->faker()->unique()->email(),
            'password' => password_hash('password', PASSWORD_BCRYPT),
            'status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }
}`
				),
				P(
					{ class: "text-muted-foreground mt-4" },
					`Factories are typically placed in the same namespace as the model with a "Factory" suffix,
					or in a Factories subdirectory.`
				)
			]),

			// Basic Usage
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Basic Usage"),
				P(
					{ class: "text-muted-foreground" },
					`Once you've created a factory, you can use it to generate model instances:`
				),
				CodeBlock(
`// Create a single user (saved to database)
$user = User::factory()->create();

// Create a single user (not saved to database)
$user = User::factory()->make();

// Create multiple users
$users = User::factory()->count(5)->create();
$users = User::factory(5)->create();  // Alternative syntax

// Create with specific attributes
$user = User::factory()->create(['name' => 'John Doe']);
$user = User::factory()->set(['name' => 'John Doe'])->create();

// Get raw attributes without creating a model
$attributes = User::factory()->raw();`
				)
			]),

			// States
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Factory States"),
				P(
					{ class: "text-muted-foreground" },
					`States allow you to define variations of your factory. Define state methods
					in your factory class with the "state" prefix:`
				),
				CodeBlock(
`class UserFactory extends Factory
{
    protected function model(): string
    {
        return User::class;
    }

    public function definition(): array
    {
        return [
            'name' => $this->faker()->name(),
            'email' => $this->faker()->email(),
            'role' => 'user'
        ];
    }

    /**
     * Define an admin user state
     */
    public function stateAdmin(): array
    {
        return ['role' => 'admin'];
    }

    /**
     * Define a verified user state
     */
    public function stateVerified(): array
    {
        return [
            'email_verified_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * State with parameters
     */
    public function stateWithDomain(string $domain): array
    {
        return [
            'email' => $this->faker()->unique()->userName() . "@{$domain}"
        ];
    }
}`
				),
				P(
					{ class: "text-muted-foreground mt-4" },
					`Use states when creating models:`
				),
				CodeBlock(
`// Apply a single state
$admin = User::factory()->state('admin')->create();

// Apply multiple states
$verifiedAdmin = User::factory()
    ->state('admin')
    ->state('verified')
    ->create();

// State with parameters
$companyUser = User::factory()
    ->state('withDomain', 'company.com')
    ->create();

// Callable state (inline modification)
$user = User::factory()
    ->state(fn($attrs) => ['name' => strtoupper($attrs['name'])])
    ->create();`
				)
			]),

			// Sequences
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Sequences"),
				P(
					{ class: "text-muted-foreground" },
					`Use sequences to apply different values to each model in a collection:`
				),
				CodeBlock(
`// Simple sequence
$users = User::factory()
    ->count(10)
    ->sequence(fn($index) => ['name' => "User {$index}"])
    ->create();

// Multiple attributes in sequence
$users = User::factory()
    ->count(3)
    ->sequence(fn($index) => [
        'name' => "User {$index}",
        'email' => "user{$index}@example.com"
    ])
    ->create();`
				)
			]),

			// Callbacks
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Lifecycle Callbacks"),
				P(
					{ class: "text-muted-foreground" },
					`Factories support callbacks that run after making or creating models,
					useful for setting up relationships or additional processing:`
				),
				CodeBlock(
`// After making (before saving to DB)
$user = User::factory()
    ->afterMaking(function ($user) {
        $user->set('verified', true);
    })
    ->create();

// After creating (after saving to DB)
$user = User::factory()
    ->afterCreating(function ($user) {
        // Create related records
        Profile::factory()->create(['user_id' => $user->id]);
        Post::factory()->count(5)->create(['user_id' => $user->id]);
    })
    ->create();

// Combine both
$user = User::factory()
    ->afterMaking(fn($u) => $u->set('status', 'pending'))
    ->afterCreating(fn($u) => $u->sendWelcomeEmail())
    ->create();`
				)
			]),

			// Using in Tests
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Using Factories in Tests"),
				P(
					{ class: "text-muted-foreground" },
					`Factories integrate seamlessly with Proto's testing system:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Tests\\Feature;

use Proto\\Tests\\Test;
use Modules\\User\\Models\\User;

class UserTest extends Test
{
    public function testUserCreation(): void
    {
        // Create test user
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com'
        ]);
    }

    public function testAdminPermissions(): void
    {
        // Create admin user
        $admin = User::factory()->state('admin')->create();

        $this->assertTrue($admin->hasRole('admin'));
    }

    public function testUserHasPosts(): void
    {
        // Create user with posts
        $user = User::factory()
            ->afterCreating(function ($user) {
                Post::factory()->count(5)->create([
                    'user_id' => $user->id
                ]);
            })
            ->create();

        $this->assertCount(5, $user->posts);
    }

    public function testBulkUserCreation(): void
    {
        // Create multiple users
        $users = User::factory()->count(10)->create();

        $this->assertDatabaseCount('users', 10);
    }
}`
				)
			]),

			// Common Patterns
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Common Testing Patterns"),
				P(
					{ class: "text-muted-foreground" },
					`Here are some common patterns for using factories in tests:`
				),
				CodeBlock(
`// Test authentication
public function testLoginRedirectsToDashboard(): void
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password')
    ]);

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertSuccessful();
}

// Test permissions
public function testAdminCanDeleteUsers(): void
{
    $admin = User::factory()->state('admin')->create();
    $user = User::factory()->create();

    $response = $this->actingAs($admin)
        ->delete("/users/{$user->id}");

    $response->assertSuccessful();
}

// Test relationships
public function testUserCanHaveMultipleOrders(): void
{
    $user = User::factory()->create();

    Order::factory()->count(3)->create([
        'user_id' => $user->id
    ]);

    $this->assertCount(3, $user->orders);
}

// Test with specific data
public function testUserWithSpecificEmail(): void
{
    $user = User::factory()->create([
        'email' => 'specific@example.com'
    ]);

    $this->assertEquals('specific@example.com', $user->email);
}`
				)
			]),

			// Faker Methods
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Common Faker Methods"),
				P(
					{ class: "text-muted-foreground" },
					`The Faker library provides many methods for generating realistic test data:`
				),
				CodeBlock(
`// Names
$faker->name()                      // Full name: "John Doe"
$faker->firstName()                 // First name: "John"
$faker->lastName()                  // Last name: "Doe"
$faker->title()                     // Title: "Mr.", "Mrs.", "Dr."

// Contact Info
$faker->email()                     // Email: "john@example.com"
$faker->unique()->email()           // Unique email
$faker->phoneNumber()               // Phone: "(555) 123-4567"
$faker->address()                   // Full address
$faker->city()                      // City: "New York"
$faker->country()                   // Country: "United States"
$faker->postcode()                  // Postal code: "12345"

// Text
$faker->word()                      // Single word
$faker->text(10)                    // 10 words of text
$faker->sentence(6)                 // Sentence with 6 words
$faker->paragraph(3)                // Paragraph with 3 sentences

// Numbers
$faker->numberBetween(1, 100)       // Random integer
$faker->randomDigit()               // 0-9
$faker->randomFloat(2, 0, 100)      // Float with 2 decimals

// Dates
$faker->dateTimeBetween('-1 year')  // Random date in past year
$faker->date('Y-m-d')               // Date string
$faker->dateTimeThisMonth()         // DateTime this month

// Internet
$faker->url()                       // URL: "https://example.com"
$faker->userName()                  // Username: "john.doe"
$faker->password()                  // Random password
$faker->ipv4()                      // IP address
$faker->userAgent()                 // Browser user agent

// Other
$faker->uuid()                      // UUID string
$faker->boolean(50)                 // Boolean (50% true)
$faker->randomElement(['a','b','c']) // Random from array
$faker->company()                   // Company name`
				)
			]),

			// Seeders Integration
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Using Factories in Seeders"),
				P(
					{ class: "text-muted-foreground" },
					`Factories work great with seeders for populating development databases:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Seeders;

use Proto\\Database\\Seeders\\Seeder;
use Modules\\User\\Models\\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create 50 regular users
        User::factory()->count(50)->create();

        // Create 3 admin users
        User::factory()
            ->count(3)
            ->state('admin')
            ->create();

        // Create specific test user
        User::factory()->create([
            'email' => 'admin@example.com',
            'name' => 'Admin User',
            'role' => 'admin'
        ]);

        // Create users with posts
        User::factory()
            ->count(10)
            ->afterCreating(function ($user) {
                Post::factory()
                    ->count(rand(1, 5))
                    ->create(['user_id' => $user->id]);
            })
            ->create();
    }
}`
				)
			]),

			// Advanced Usage
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Advanced Usage"),
				P(
					{ class: "text-muted-foreground" },
					`Advanced factory techniques for complex scenarios:`
				),
				CodeBlock(
`// Static factory methods
UserFactory::new()->create();
UserFactory::times(5)->create();

// Conditional attributes
public function definition(): array
{
    return [
        'name' => $this->faker()->name(),
        'email' => $this->faker()->email(),
        'role' => $this->faker()->randomElement(['user', 'moderator']),
        'status' => function () {
            return $this->faker()->boolean(80) ? 'active' : 'inactive';
        }
    ];
}

// Dependent attributes
public function definition(): array
{
    $name = $this->faker()->name();

    return [
        'name' => $name,
        'slug' => strtolower(str_replace(' ', '-', $name)),
        'email' => $this->faker()->email()
    ];
}

// Chaining multiple operations
$users = User::factory()
    ->count(10)
    ->state('verified')
    ->sequence(fn($i) => ['priority' => $i])
    ->afterCreating(fn($u) => $u->sendWelcomeEmail())
    ->create();`
				)
			]),

			// Best Practices
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Best Practices"),
				P(
					{ class: "text-muted-foreground" },
					`Follow these best practices when using factories:`
				),
				Ul({ class: "list-disc list-inside space-y-2 text-muted-foreground ml-4" }, [
					Li({}, "Keep factory definitions simple - use states for variations"),
					Li({}, "One factory per model - don't share factories between models"),
					Li({}, "Use callbacks for relationships - keeps code clean and explicit"),
					Li({}, "Name states clearly - use descriptive names like stateAdmin() not state1()"),
					Li({}, "Use unique() for unique constraints to avoid database errors"),
					Li({}, "Leverage Faker for realistic data instead of hardcoded values"),
					Li({}, "Create factories even for simple models - they're useful for testing"),
					Li({}, "Test with factories instead of manual data creation - faster and more maintainable")
				])
			]),

			// Troubleshooting
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Troubleshooting"),
				P(
					{ class: "text-muted-foreground" },
					`Common issues and solutions when working with factories:`
				),
				CodeBlock(
`// Issue: "Factory class not found"
// Solution: Ensure factory is in correct location:
// - ModelClass + "Factory" suffix in same namespace
// - ModelClass\\Factories\\ModelClassFactory
// - Or override factoryClass() in your model

class User extends Model
{
    public static function factoryClass(): string
    {
        return UserFactory::class;
    }
}

// Issue: "Failed to create model"
// Solution: Check model's add() method and database table exists

// Issue: State method not found
// Solution: State methods must be named "state" + PascalCase:
// Wrong:  public function admin() { ... }
// Correct: public function stateAdmin() { ... }

// Issue: Unique constraint violation
// Solution: Use unique() for unique fields
public function definition(): array
{
    return [
        'email' => $this->faker()->unique()->email(),
        'username' => $this->faker()->unique()->userName()
    ];
}

// Issue: Relationship not working
// Solution: Use afterCreating callback for relationships
$user = User::factory()
    ->afterCreating(function ($user) {
        Profile::factory()->create(['user_id' => $user->id]);
    })
    ->create();`
				)
			]),

			// Complete Example
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Complete Example"),
				P(
					{ class: "text-muted-foreground" },
					`Here's a complete example showing a model, factory, and test working together:`
				),
				CodeBlock(
`// Model: Modules/Blog/Models/Post.php
<?php declare(strict_types=1);
namespace Modules\\Blog\\Models;

use Proto\\Models\\Model;
use Proto\\Models\\Traits\\HasFactory;

class Post extends Model
{
    use HasFactory;

    protected static ?string $tableName = 'posts';
    protected static array $fields = [
        'id', 'title', 'content', 'status',
        'user_id', 'created_at', 'updated_at'
    ];
}

// Factory: Modules/Blog/Models/PostFactory.php
<?php declare(strict_types=1);
namespace Modules\\Blog\\Models;

use Proto\\Models\\Factory;

class PostFactory extends Factory
{
    protected function model(): string
    {
        return Post::class;
    }

    public function definition(): array
    {
        return [
            'title' => $this->faker()->sentence(5),
            'content' => $this->faker()->paragraphs(3, true),
            'status' => 'draft',
            'user_id' => 1,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }

    public function statePublished(): array
    {
        return [
            'status' => 'published',
            'published_at' => date('Y-m-d H:i:s')
        ];
    }

    public function stateFeatured(): array
    {
        return ['featured' => true];
    }
}

// Test: Modules/Blog/Tests/Unit/PostTest.php
<?php declare(strict_types=1);
namespace Modules\\Blog\\Tests\\Unit;

use Proto\\Tests\\Test;
use Modules\\Blog\\Models\\Post;
use Modules\\User\\Models\\User;

class PostTest extends Test
{
    public function testCreatePost(): void
    {
        $user = User::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $user->id
        ]);

        $this->assertNotNull($post->id);
        $this->assertEquals('draft', $post->status);
    }

    public function testPublishedPost(): void
    {
        $post = Post::factory()
            ->state('published')
            ->create();

        $this->assertEquals('published', $post->status);
        $this->assertNotNull($post->published_at);
    }

    public function testUserCanHaveMultiplePosts(): void
    {
        $user = User::factory()->create();

        Post::factory()
            ->count(5)
            ->create(['user_id' => $user->id]);

        $this->assertCount(5, $user->posts);
    }

    public function testFeaturedPublishedPost(): void
    {
        $post = Post::factory()
            ->state('published')
            ->state('featured')
            ->create();

        $this->assertTrue($post->featured);
        $this->assertEquals('published', $post->status);
    }
}`
				)
			])
		]
	);

export default FactoriesPage;

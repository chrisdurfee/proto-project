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
 * SeedersPage
 *
 * This page explains the comprehensive Proto seeder system for populating
 * databases with test data, initial data, or sample data. It covers the abstract
 * base seeder class, seeder manager, database operations, and integration with testing.
 *
 * @returns {DocPage}
 */
export const SeedersPage = () =>
	DocPage(
		{
			title: 'Seeders',
			description: 'Comprehensive database seeder system for populating databases with test data, initial data, or sample data.'
		},
		[
			// Overview
			Section({ class: "flex flex-col gap-y-4" }, [
				H4({ class: "text-lg font-bold" }, "Overview"),
				P(
					{ class: "text-muted-foreground" },
					`Proto's comprehensive database seeder system provides an organized way to populate
					databases with consistent, reliable data for development, testing, and initial
					deployment scenarios. The system includes an abstract base seeder class with common
					database operations, a seeder manager for organizing and running multiple seeders,
					built-in support for table operations, and seamless integration with the testing system.`
				)
			]),

			// Basic Usage
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Basic Usage"),
				P(
					{ class: "text-muted-foreground" },
					`Creating and running seeders is straightforward with Proto's seeder system:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Database\\Seeders;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Only seed if table is empty
        if (!$this->isEmpty('users')) {
            return;
        }

        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => password_hash('password123', PASSWORD_DEFAULT),
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => password_hash('password123', PASSWORD_DEFAULT),
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('users', $users);
    }
}`
				)
			]),

			// Running Seeders
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Running Seeders"),
				P(
					{ class: "text-muted-foreground" },
					`Proto provides multiple ways to execute seeders, from individual seeders to batch operations:`
				),
				CodeBlock(
`// Individual Seeder
$seeder = new UserSeeder();
$seeder->run();

// Using SeederManager for single seeder
use Proto\\Database\\Seeders\\SeederManager;

$manager = new SeederManager();
$manager->run(UserSeeder::class);

// Run multiple seeders in sequence
$manager->runMany([
    RoleSeeder::class,
    UserSeeder::class,
    ProductSeeder::class
]);

// Using DatabaseSeeder to run all configured seeders
$databaseSeeder = new DatabaseSeeder();
$databaseSeeder->run(); // Runs all configured seeders`
				)
			]),

			// Seeder Base Class Methods
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Seeder Base Class Methods"),
				P(
					{ class: "text-muted-foreground" },
					`The Seeder base class provides essential methods for database operations and seeder management:`
				),
				CodeBlock(
`class ExampleSeeder extends Seeder
{
    public function run(): void
    {
        // Database Operations

        // Insert data into a table
        $this->insert('users', [
            ['name' => 'John', 'email' => 'john@example.com'],
            ['name' => 'Jane', 'email' => 'jane@example.com']
        ]);

        // Truncate a table (remove all data)
        $this->truncate('users');

        // Check if table is empty
        if ($this->isEmpty('users')) {
            // Seed data only if table is empty
            $this->seedUsers();
        }

        // Get database connection
        $db = $this->getConnection();
        $testDb = $this->getConnection('testing'); // Specific connection

        // Calling Other Seeders

        // Call another seeder
        $this->call(RoleSeeder::class);

        // Call multiple seeders
        $this->callMany([
            RoleSeeder::class,
            PermissionSeeder::class
        ]);
    }

    private function seedUsers(): void
    {
        // Implementation
    }
}`
				)
			]),

			// Seeder Examples
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Seeder Examples"),
				P(
					{ class: "text-muted-foreground" },
					`Here are practical examples of common seeder patterns:`
				),
				CodeBlock(
`// User Seeder with Roles
<?php declare(strict_types=1);
namespace Proto\\Database\\Seeders;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!$this->isEmpty('users')) {
            return;
        }

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'role' => 'admin',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Regular User',
                'email' => 'user@example.com',
                'password' => password_hash('user123', PASSWORD_DEFAULT),
                'role' => 'user',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('users', $users);
    }
}

// Role Seeder
<?php declare(strict_types=1);
namespace Proto\\Database\\Seeders;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        if (!$this->isEmpty('roles')) {
            return;
        }

        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'System administrator with full access',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'user',
                'display_name' => 'User',
                'description' => 'Regular user with basic access',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('roles', $roles);
    }
}`
				)
			]),

			// Seeder with Relationships
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Seeders with Relationships"),
				P(
					{ class: "text-muted-foreground" },
					`Handle related data by calling dependent seeders first:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Database\\Seeders;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure categories exist first
        $this->call(CategorySeeder::class);

        if (!$this->isEmpty('products')) {
            return;
        }

        $products = [
            [
                'name' => 'Laptop Pro',
                'description' => 'High-performance laptop for professionals',
                'price' => 1299.99,
                'category_id' => 1, // Electronics category
                'stock' => 50,
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Wireless Mouse',
                'description' => 'Ergonomic wireless mouse with USB receiver',
                'price' => 29.99,
                'category_id' => 1, // Electronics category
                'stock' => 100,
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Office Chair',
                'description' => 'Comfortable ergonomic office chair',
                'price' => 199.99,
                'category_id' => 2, // Furniture category
                'stock' => 25,
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('products', $products);
    }
}

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        if (!$this->isEmpty('categories')) {
            return;
        }

        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Electronic devices and accessories',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Furniture',
                'slug' => 'furniture',
                'description' => 'Office and home furniture',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('categories', $categories);
    }
}`
				)
			]),

			// Integration with Testing
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Integration with Testing"),
				P(
					{ class: "text-muted-foreground" },
					`Seeders integrate seamlessly with Proto's testing system for consistent test data:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Tests\\Unit;

use Proto\\Tests\\Test;
use Proto\\Database\\Seeders\\UserSeeder;
use Proto\\Database\\Seeders\\RoleSeeder;

class UserTest extends Test
{
    // Seeders to run before each test
    protected array $seeders = [
        RoleSeeder::class,
        UserSeeder::class
    ];

    public function testUserCreation(): void
    {
        // Seeders have run automatically
        $this->assertDatabaseCount('users', 2); // Admin + Regular user
        $this->assertDatabaseCount('roles', 2); // Admin + User roles

        // Test with seeded data
        $adminUser = User::where(['role', 'admin'])->first();
        $this->assertNotNull($adminUser);
        $this->assertEquals('Admin User', $adminUser->name);
    }

    public function testUserAuthentication(): void
    {
        // Use seeded data for testing
        $user = User::where(['email', 'user@example.com'])->first();

        $this->assertNotNull($user);
        $this->assertTrue(password_verify('user123', $user->password));
    }
}`
				)
			]),

			// Test-Specific Seeders
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Test-Specific Seeders"),
				P(
					{ class: "text-muted-foreground" },
					`Create specialized seeders for testing scenarios:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Proto\\Tests\\Seeders;

use Proto\\Database\\Seeders\\Seeder;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        $testUsers = [
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => password_hash('testpass', PASSWORD_DEFAULT),
                'role' => 'user',
                'status' => 'active',
                'email_verified' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'name' => 'Inactive Test User',
                'email' => 'inactive@example.com',
                'password' => password_hash('testpass', PASSWORD_DEFAULT),
                'role' => 'user',
                'status' => 'inactive',
                'email_verified' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->insert('users', $testUsers);
    }
}

// Use in test
class UserStatusTest extends Test
{
    protected array $seeders = [TestUserSeeder::class];

    public function testActiveUserCanLogin(): void
    {
        $user = User::where(['email', 'test@example.com'])->first();
        $this->assertEquals('active', $user->status);
    }

    public function testInactiveUserCannotLogin(): void
    {
        $user = User::where(['email', 'inactive@example.com'])->first();
        $this->assertEquals('inactive', $user->status);
    }
}`
				)
			]),

			// Advanced Usage
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Advanced Usage"),
				P(
					{ class: "text-muted-foreground" },
					`Advanced seeder patterns for complex scenarios:`
				),
				CodeBlock(
`// Conditional Seeding Based on Environment
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $environment = env('env') ?? 'production';

        if ($environment === 'testing') {
            $this->seedTestUsers();
        } elseif ($environment === 'development') {
            $this->seedDevelopmentUsers();
        } else {
            $this->seedProductionUsers();
        }
    }

    private function seedTestUsers(): void
    {
        $users = [
            [
                'name' => 'Test Admin',
                'email' => 'admin@test.com',
                'password' => password_hash('test123', PASSWORD_DEFAULT),
                'role' => 'admin'
            ]
        ];
        $this->insert('users', $users);
    }

    private function seedDevelopmentUsers(): void
    {
        // Generate 50 fake users for development
        $users = [];
        for ($i = 1; $i <= 50; $i++) {
            $users[] = [
                'name' => "Dev User {$i}",
                'email' => "dev{$i}@example.com",
                'password' => password_hash('dev123', PASSWORD_DEFAULT),
                'role' => $i <= 5 ? 'admin' : 'user',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }
        $this->insert('users', $users);
    }

    private function seedProductionUsers(): void
    {
        // Only essential users for production
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@company.com',
                'password' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
                'role' => 'admin',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];
        $this->insert('users', $users);
    }
}`
				)
			]),

			// Using Faker for Random Data
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Using Faker for Random Data"),
				P(
					{ class: "text-muted-foreground" },
					`Generate realistic fake data for development and testing:`
				),
				CodeBlock(
`class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!$this->isEmpty('users')) {
            return;
        }

        $users = [];
        for ($i = 0; $i < 50; $i++) {
            $users[] = [
                'name' => $this->faker()->name(),
                'email' => $this->faker()->unique()->email(),
                'password' => password_hash('password', PASSWORD_DEFAULT),
                'phone' => $this->faker()->phoneNumber(),
                'status' => $this->faker()->boolean(80) ? 'active' : 'inactive',
                'bio' => $this->faker()->sentence(10),
                'created_at' => $this->faker()->dateTimeBetween('-1 year', 'now')->format('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }

        $this->insert('users', $users);
    }

    private function faker()
    {
        // Integration with Proto's SimpleFaker or other faker library
        return new \\Proto\\Tests\\SimpleFaker();
    }
}

// Complex data generation
class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure users exist first
        $this->call(UserSeeder::class);

        if (!$this->isEmpty('blog_posts')) {
            return;
        }

        $posts = [];
        $faker = $this->faker();

        for ($i = 0; $i < 100; $i++) {
            $posts[] = [
                'title' => $faker->sentence(6),
                'slug' => $faker->slug(6),
                'content' => $faker->paragraphs(5, true),
                'excerpt' => $faker->sentence(15),
                'status' => $faker->randomElement(['draft', 'published', 'scheduled']),
                'author_id' => $faker->numberBetween(1, 50),
                'published_at' => $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d H:i:s'),
                'created_at' => $faker->dateTimeBetween('-1 year', '-6 months')->format('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }

        $this->insert('blog_posts', $posts);
    }
}`
				)
			]),

			// File Structure
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "File Structure"),
				P(
					{ class: "text-muted-foreground" },
					`Organize your seeders following this recommended structure:`
				),
				CodeBlock(
`common/
├── Database/
│   └── Seeders/
│       ├── Seeder.php              # Abstract base class
│       ├── SeederManager.php       # Manages seeder execution
│       ├── DatabaseSeeder.php      # Main seeder runner
│       ├── UserSeeder.php          # User data seeder
│       ├── RoleSeeder.php          # Role data seeder
│       ├── CategorySeeder.php      # Category data seeder
│       ├── ProductSeeder.php       # Product data seeder
│       └── ...                     # Other domain seeders
└── Tests/
    └── Seeders/
        ├── TestUserSeeder.php      # Test-specific user seeder
        ├── TestProductSeeder.php   # Test-specific product seeder
        └── ...                     # Other test seeders

modules/
├── User/
│   └── Database/
│       └── Seeders/
│           └── UserModuleSeeder.php # Module-specific seeders
└── Product/
    └── Database/
        └── Seeders/
            └── ProductModuleSeeder.php`
				)
			]),

			// Using Factories in Seeders
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Using Factories in Seeders"),
				P(
					{ class: "text-muted-foreground" },
					`Factories provide a cleaner way to generate test data within seeders. Use them instead of building data arrays manually:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Seeders;

use Proto\\Database\\Seeders\\Seeder;
use Modules\\User\\Models\\User;
use Modules\\Group\\Models\\Group;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create multiple users with factories
        User::factory()->count(10)->create();

        // Create with specific attributes
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin'
        ]);

        // Create with factory states
        User::factory()->admin()->create();
        User::factory()->inactive()->count(5)->create();

        // Create related data
        $group = Group::factory()->create();
        User::factory()->count(5)->create([
            'groupId' => $group->id
        ]);
    }
}`
				),
				P(
					{ class: "text-muted-foreground font-semibold" },
					`CRITICAL: When using SimpleFaker directly in seeders, use $this->faker() as a METHOD call, NOT a property:`
				),
				CodeBlock(
`// ✅ CORRECT - Method call
$faker = $this->faker();
$name = $faker->name();

// ❌ WRONG - Property access (will fail)
$name = $this->faker->name(); // Error!

// Direct usage in data generation
$posts = [];
for ($i = 0; $i < 10; $i++) {
    $posts[] = [
        'title' => $this->faker()->sentence(6),
        'content' => $this->faker()->paragraph(3),
        'authorId' => $this->faker()->numberBetween(1, 10)
    ];
}`
				)
			]),

			// Best Practices
			Section({ class: "flex flex-col gap-y-4 mt-12" }, [
				H4({ class: "text-lg font-bold" }, "Best Practices"),
				P(
					{ class: "text-muted-foreground" },
					`Follow these best practices for effective seeding in Proto:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("**Check if data exists** - Use isEmpty() to avoid duplicate data and enable re-running seeders"),
					Li("**Order matters** - Run seeders in correct dependency order (roles before users, categories before products)"),
					Li("**Use relationships** - Call dependent seeders using call() method to ensure data integrity"),
					Li("**Environment awareness** - Different data amounts and types for different environments"),
					Li("**Keep it simple** - Focus on essential data for the seeder's specific purpose"),
					Li("**Use consistent timestamps** - Always include created_at and updated_at fields"),
					Li("**Hash passwords** - Always hash passwords properly in user-related seeders"),
					Li("**Clean data** - Ensure data integrity, validation, and realistic relationships"),
					Li("**Use faker wisely** - Generate realistic but consistent fake data for development"),
					Li("**Modular approach** - Create focused seeders for specific domains or features"),
					Li("**Test integration** - Leverage seeders in your test suite for consistent test data"),
					Li("**Performance consideration** - Use batch inserts for large datasets rather than individual records")
				])
			])
		]
	);

export default SeedersPage;
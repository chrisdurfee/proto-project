<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

/**
 * Migration to seed initial roles and permissions.
 * @suppresswarnings PHP6609
 */
class SeedRolesAndPermissions extends Migration
{
    /**
     * @var string $connection The database connection name.
     */
    protected string $connection = 'default';

    /**
     * Runs the migration.
     *
     * @return void
     */
    public function up(): void
    {

    }

    /**
     * Seed the database with roles and permissions.
     *
     * @return void
     */
    public function seed(): void
    {
        // Define basic roles
        $roles = [
            [
                'name' => 'Administrator',
                'slug' => 'admin',
                'description' => 'Full system access'
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Manage content and users'
            ],
            [
                'name' => 'Editor',
                'slug' => 'editor',
                'description' => 'Edit content'
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular user access'
            ],
        ];

        // Insert roles
        foreach ($roles as $role)
        {
            $this->insert('roles', $role);
        }

        // Define basic permissions
        $permissions = [
            // User management permissions
            [
                'name' => 'View Users',
                'slug' => 'users.view',
                'description' => 'Can view users',
                'module' => 'user',
            ],
            [
                'name' => 'Create Users',
                'slug' => 'users.create',
                'description' => 'Can create users',
                'module' => 'user',
            ],
            [
                'name' => 'Edit Users',
                'slug' => 'users.edit',
                'description' => 'Can edit users',
                'module' => 'user',
            ],
            [
                'name' => 'Delete Users',
                'slug' => 'users.delete',
                'description' => 'Can delete users',
                'module' => 'user',
            ],

            // Role management permissions
            [
                'name' => 'View Roles',
                'slug' => 'roles.view',
                'description' => 'Can view roles',
                'module' => 'user',
            ],
            [
                'name' => 'Create Roles',
                'slug' => 'roles.create',
                'description' => 'Can create roles',
                'module' => 'user',
            ],
            [
                'name' => 'Edit Roles',
                'slug' => 'roles.edit',
                'description' => 'Can edit roles',
                'module' => 'user',
            ],
            [
                'name' => 'Delete Roles',
                'slug' => 'roles.delete',
                'description' => 'Can delete roles',
                'module' => 'user',
            ],

            // Permission management permissions
            [
                'name' => 'View Permissions',
                'slug' => 'permissions.view',
                'description' => 'Can view permissions',
                'module' => 'user',
            ],
            [
                'name' => 'Assign Permissions',
                'slug' => 'permissions.assign',
                'description' => 'Can assign permissions',
                'module' => 'user',
            ],
            [
                'name' => 'CRM Access',
                'slug' => 'crm.access',
                'description' => 'Can access CRM features',
                'module' => 'crm',
            ],
        ];

        // Insert permissions
        foreach ($permissions as $permission)
        {
            $this->insert('permissions', $permission);
        }

        // Assign permissions to roles

        // Get the role IDs
        $adminRoleId = $this->getRoleId('admin');
        $managerRoleId = $this->getRoleId('manager');
        $editorRoleId = $this->getRoleId('editor');

        // Assign all permissions to the manager role
        $allPermissions = $this->fetch('SELECT id FROM permissions');
        foreach ($allPermissions as $permission)
        {
            $this->insert('permission_roles', [
                'role_id' => $adminRoleId,
                'permission_id' => $permission->id,
            ]);

            $this->insert('permission_roles', [
                'role_id' => $managerRoleId,
                'permission_id' => $permission->id,
            ]);
        }

        // Assign only view and edit permissions to the editor role
        $editorPermissions = $this->fetch('SELECT id FROM permissions WHERE slug LIKE "%.view" OR slug LIKE "%.edit"');
        foreach ($editorPermissions as $permission)
        {
            $this->insert('permission_roles', [
                'role_id' => $editorRoleId,
                'permission_id' => $permission->id,
            ]);
        }
    }

    /**
     * Get role ID by slug.
     *
     * @param string $slug Role slug.
     * @return int|null Role ID or null if not found.
     */
    protected function getRoleId(string $slug): ?int
    {
        $role = $this->first('SELECT id FROM roles WHERE slug = ?', [$slug]);
        return $role ? $role->id : null;
    }

    /**
     * Reverts the migration.
     *
     * @return void
     */
    public function down(): void
    {

    }
}
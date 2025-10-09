# Contributing to Proto Project

Thank you for your interest in contributing to Proto Project! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Docker Desktop** (or Docker Engine on Linux)
- **Node.js 18+** for frontend development
- **Git** for version control
- **PHP 8.4+** knowledge (for backend contributions)
- **Familiarity with Proto Framework** (see [documentation](https://github.com/protoframework/proto))

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/proto-project.git
   cd proto-project
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/protoframework/proto-project.git
   ```

4. **Set up the development environment**:
   ```bash
   # Copy example configuration
   cp common/Config/.env-example common/Config/.env

   # Sync configuration to Docker
   ./infrastructure/scripts/run.sh sync-config

   # Start backend services
   docker-compose -f infrastructure/docker-compose.yaml up -d

   # Install frontend dependencies
   cd apps/main && npm install
   cd ../crm && npm install
   cd ../developer && npm install
   ```

5. **Verify setup**:
   ```bash
   # Run tests
   docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit

   # Check that services are running
   docker-compose -f infrastructure/docker-compose.yaml ps
   ```

---

## 💡 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Fix issues in existing code
- **New features** - Add new functionality
- **Documentation** - Improve or add documentation
- **Tests** - Add or improve test coverage
- **Code quality** - Refactoring and optimization
- **Examples** - Add example modules or use cases

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `test/description` - Test additions/improvements
- `refactor/description` - Code refactoring

### 2. Make Your Changes

- Write clean, readable code following our [coding standards](#coding-standards)
- Add or update tests as necessary
- Update documentation if needed
- Keep commits focused and atomic

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user profile export functionality"
```

#### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

**Examples:**
```
feat(auth): add two-factor authentication support
fix(user): resolve issue with password reset email
docs(readme): update installation instructions
test(api): add integration tests for authentication
```

### 4. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

If conflicts occur, resolve them and continue:

```bash
# Resolve conflicts in your editor
git add .
git rebase --continue
```

---

## 📐 Coding Standards

### PHP Code Standards

Follow **PSR-12** coding standards:

- Use 4 spaces for indentation (no tabs)
- Opening braces for classes/methods on the same line
- Use type hints for parameters and return types
- Declare strict types: `<?php declare(strict_types=1);`

**Example:**
```php
<?php declare(strict_types=1);

namespace Modules\Example\Controllers;

use Proto\Controllers\ResourceController;

class ExampleController extends ResourceController
{
    public function __construct(protected ?string $model = Example::class)
    {
        parent::__construct();
    }

    protected function validate(): array
    {
        return [
            'name' => 'string:255|required',
            'email' => 'email|required'
        ];
    }
}
```

### JavaScript/TypeScript Standards

- Use ES6+ features
- 2 spaces for indentation
- Use `const` and `let` (avoid `var`)
- Prefer arrow functions for callbacks
- Use meaningful variable names

**Example:**
```javascript
// Good
const fetchUserData = async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
};

// Avoid
var x = function(id) {
    return fetch('/api/users/' + id).then(r => r.json());
};
```

### Naming Conventions

- **Classes**: PascalCase (`UserController`, `EmailService`)
- **Methods/Functions**: camelCase (`getUserById`, `sendEmail`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ATTEMPTS`, `DEFAULT_TIMEOUT`)
- **Variables**: camelCase (`userId`, `userData`)
- **Database Tables**: snake_case (`user_roles`, `product_categories`)

---

## 🧪 Testing Guidelines

### Writing Tests

- Place tests in appropriate directories:
  - `common/Tests/Unit/` - Unit tests
  - `common/Tests/Feature/` - Integration tests
  - `modules/*/Tests/` - Module-specific tests

- Name test methods descriptively:
  ```php
  public function testUserCanBeCreatedWithValidData(): void
  public function testLoginFailsWithInvalidCredentials(): void
  ```

### Running Tests

```bash
# Run all tests
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit

# Run specific test suite
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --testsuite=Feature

# Run with coverage
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --coverage-html coverage/

# Run specific test file
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit modules/User/Tests/Feature/UserTest.php
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Aim for 75%+ code coverage on critical paths
- Tests should be independent and repeatable
- Use factories for test data

**Example:**
```php
<?php declare(strict_types=1);

namespace Modules\User\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Models\User;

class UserTest extends Test
{
    public function testUserCanBeCreated(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secure_password_123'
        ];

        $user = User::create($userData);

        $this->assertNotNull($user->id);
        $this->assertEquals('John Doe', $user->name);
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }
}
```

---

## 📤 Submitting Changes

### Before Submitting

Ensure your contribution meets these criteria:

- [ ] Code follows the project's coding standards
- [ ] All tests pass locally
- [ ] New features include tests
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow the conventional format
- [ ] Branch is up to date with `upstream/main`
- [ ] No merge conflicts exist

### Creating a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Navigate to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Title Format**:
   ```
   feat: add user profile export functionality
   fix: resolve database connection timeout issue
   docs: improve installation instructions
   ```

4. **PR Description Should Include**:
   - Summary of changes
   - Related issue numbers (e.g., "Fixes #123")
   - Screenshots (for UI changes)
   - Testing performed
   - Breaking changes (if any)

**Example PR Description:**
```markdown
## Description
Adds two-factor authentication support for user accounts.

## Related Issues
Fixes #456

## Changes Made
- Added TOTP generation and verification
- Created migration for 2FA settings table
- Added user settings UI for 2FA enrollment
- Added tests for 2FA flows

## Testing
- [ ] Unit tests pass
- [ ] Feature tests pass
- [ ] Manually tested 2FA enrollment flow
- [ ] Tested on Chrome, Firefox, Safari

## Screenshots
[Include screenshots if applicable]

## Breaking Changes
None
```

### Review Process

- Maintainers will review your PR within 3-5 business days
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Verify the bug** in the latest version
3. **Collect information** about your environment

### Bug Report Template

Create a new issue with this information:

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Ubuntu 22.04]
- Docker version: [e.g., 24.0.5]
- PHP version: [e.g., 8.4]
- Node version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 118]

## Error Messages
```
Paste any error messages here
```

## Additional Context
Any other relevant information, screenshots, or logs.
```

---

## 💡 Feature Requests

We welcome feature suggestions! To propose a new feature:

1. **Check existing issues** to see if it's already proposed
2. **Create a new issue** with the "feature request" label
3. **Describe the feature** clearly:
   - What problem does it solve?
   - How should it work?
   - Are there any alternatives you've considered?

### Feature Request Template

```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Problem/Use Case
What problem would this feature solve? Who would benefit?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches have you thought about?

## Additional Context
Screenshots, mockups, or examples from other projects.
```

---

## 📚 Additional Resources

- [Proto Framework Documentation](https://github.com/protoframework/proto)
- [Project README](README.md)
- [Quick Start Guide](QUICK-START.md)
- [Development Guide](infrastructure/docs/DEVELOPMENT.md)
- [Testing Guide](infrastructure/docs/QUICK-TEST-GUIDE.md)

---

## 🙏 Thank You!

Your contributions make Proto Project better for everyone. We appreciate your time and effort in helping improve this project!

---

## 📝 Questions?

If you have questions about contributing, feel free to:

- Open a discussion on GitHub
- Contact the maintainers
- Ask in the project's community channels

**Happy Contributing!** 🎉

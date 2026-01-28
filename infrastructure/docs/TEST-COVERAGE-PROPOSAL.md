# Test Coverage Proposal

## Executive Summary

Current test coverage is minimal with only 2-3 test files in the User module. This document proposes comprehensive testing across critical system areas to ensure reliability, security, and maintainability.

**Current Coverage**: ~5% (estimated)
**Target Coverage**: 70-80% of critical paths
**Priority**: High-risk security and business logic first

---

## 🎯 Critical Priority Areas (P0)

### 1. Authentication & Authorization System ⚠️ **CRITICAL**

**Why Critical**: Security vulnerabilities can lead to unauthorized access, data breaches, and compliance violations.

**Current State**: ❌ No tests found
**Risk Level**: 🔴 **CRITICAL** - Production system exposed

#### Test Coverage Needed:

##### `modules/Auth/Tests/Feature/LoginTest.php`
```php
<?php declare(strict_types=1);
namespace Modules\Auth\Tests\Feature;

use Proto\Tests\Test;
use Modules\User\Main\Models\User;

class LoginTest extends Test
{
    public function testSuccessfulLoginReturnsToken(): void
    {
        // Test successful authentication flow
    }

    public function testLoginWithInvalidCredentialsFails(): void
    {
        // Test authentication rejection
    }

    public function testMaxLoginAttemptsBlocksUser(): void
    {
        // Test brute force protection (10 attempts max)
    }

    public function testLoginWithDisabledAccountFails(): void
    {
        // Test account status checking
    }

    public function testLoginClearsAttemptCounterOnSuccess(): void
    {
        // Verify attempt tracking resets
    }

    public function testLoginRecordsIPAddressAndTimestamp(): void
    {
        // Verify audit logging
    }
}
```

##### `modules/Auth/Tests/Feature/MultiFactorAuthTest.php`
```php
class MultiFactorAuthTest extends Test
{
    public function testMFARequiredWhenEnabled(): void
    {
        // Test MFA gate activation
    }

    public function testMFACodeGenerationAndValidation(): void
    {
        // Test TOTP/SMS code flow
    }

    public function testMFADeviceRecognition(): void
    {
        // Test device authorization (UserAuthedDevice)
    }

    public function testMFAMaxAttemptsPreventsReplay(): void
    {
        // Test MFA brute force protection
    }

    public function testMFALocationTracking(): void
    {
        // Test IP-based location verification
    }

    public function testAuthorizedDeviceSkipsMFA(): void
    {
        // Test trusted device bypass
    }
}
```

##### `modules/Auth/Tests/Feature/PasswordResetTest.php`
```php
class PasswordResetTest extends Test
{
    public function testPasswordResetRequestSendsEmail(): void
    {
        // Test reset email dispatch
    }

    public function testPasswordResetCodeValidation(): void
    {
        // Test reset code verification
    }

    public function testPasswordResetCodeExpiration(): void
    {
        // Test time-based expiration
    }

    public function testPasswordResetUpdatesCredentials(): void
    {
        // Test password update
    }

    public function testPasswordResetInvalidatesOldSessions(): void
    {
        // Test session cleanup on password change
    }
}
```

##### `modules/Auth/Tests/Unit/LoginAttemptControllerTest.php`
```php
class LoginAttemptControllerTest extends Test
{
    public function testAttemptCounterIncrementsOnFailure(): void
    {
        // Test attempt tracking
    }

    public function testAttemptCounterResetAfterTimeout(): void
    {
        // Test TTL-based reset
    }

    public function testMultipleIPsTrackedSeparately(): void
    {
        // Test IP-based isolation
    }
}
```

**Files to Test**:
- ✅ `modules/Auth/Controllers/AuthController.php` (login, MFA, logout)
- ✅ `modules/Auth/Controllers/PasswordController.php` (reset flow)
- ✅ `modules/Auth/Controllers/LoginAttemptController.php` (rate limiting)
- ✅ `modules/Auth/Controllers/Multifactor/UserAuthedConnectionController.php`
- ✅ `modules/Auth/Services/Auth/MultiFactorAuthService.php`

**Estimated Tests**: 25-30 test methods
**Estimated Time**: 2-3 days

---

### 2. User Management & Permissions System

**Why Critical**: User data integrity and permission enforcement are core to multi-tenant systems.

**Current State**: ⚠️ Partial (2 test files: ConfirmPassword, UserRoles)
**Risk Level**: 🟠 **HIGH**

#### Test Coverage Needed:

##### `modules/User/Tests/Feature/UserRegistrationTest.php`
```php
class UserRegistrationTest extends Test
{
    public function testUserRegistrationCreatesAccount(): void
    {
        // Test account creation
    }

    public function testUserRegistrationValidatesEmail(): void
    {
        // Test email format validation
    }

    public function testUserRegistrationPreventsEmailDuplicates(): void
    {
        // Test unique constraint
    }

    public function testUserRegistrationHashesPassword(): void
    {
        // Test password security (bcrypt)
    }

    public function testUserRegistrationAssignsDefaultRole(): void
    {
        // Test role assignment
    }

    public function testUserRegistrationSendsWelcomeEmail(): void
    {
        // Test email notification
    }
}
```

##### `modules/User/Tests/Feature/UserCRUDTest.php`
```php
class UserCRUDTest extends Test
{
    protected ?string $policy = UserPolicy::class;

    public function testUserListFiltersByStatus(): void
    {
        // Test query filtering
    }

    public function testUserGetReturnsUserDetails(): void
    {
        // Test single user retrieval
    }

    public function testUserUpdateModifiesFields(): void
    {
        // Test update operation
    }

    public function testUserUpdateValidatesData(): void
    {
        // Test validation rules
    }

    public function testUserDeleteSoftDeletesRecord(): void
    {
        // Test soft delete (if implemented)
    }

    public function testUserSearchFindsMatches(): void
    {
        // Test search functionality
    }
}
```

##### `modules/User/Tests/Unit/PermissionTest.php`
```php
class PermissionTest extends Test
{
    public function testUserHasPermissionViaRole(): void
    {
        // Test role-based permissions
    }

    public function testUserHasDirectPermission(): void
    {
        // Test user-specific permissions
    }

    public function testPermissionInheritanceFromMultipleRoles(): void
    {
        // Test multi-role aggregation
    }

    public function testPermissionRevocation(): void
    {
        // Test permission removal
    }
}
```

##### `modules/User/Tests/Unit/RoleManagementTest.php`
```php
class RoleManagementTest extends Test
{
    public function testRoleAttachmentToUser(): void
    {
        // Extend existing UserRolesTest
    }

    public function testRolePermissionAssignment(): void
    {
        // Test permission-to-role binding
    }

    public function testRoleHierarchy(): void
    {
        // Test role inheritance (if implemented)
    }
}
```

**Files to Test**:
- ✅ `modules/User/Controllers/UserController.php`
- ✅ `modules/User/Controllers/RoleController.php`
- ✅ `modules/User/Controllers/PermissionController.php`
- ✅ `modules/User/Storage/UserStorage.php`
- ✅ `modules/User/Models/User.php`
- ⚠️ `common/Auth/Policies/UserPolicy.php` (policy enforcement)

**Estimated Tests**: 20-25 test methods
**Estimated Time**: 2 days

---

### 3. API Request/Response Cycle

**Why Critical**: API is the primary interface; errors affect all clients (main, CRM, developer apps).

**Current State**: ❌ No tests found
**Risk Level**: 🟠 **HIGH**

#### Test Coverage Needed:

##### `common/Tests/Feature/Api/RoutingTest.php`
```php
class RoutingTest extends Test
{
    public function testResourceRoutesResolveCorrectly(): void
    {
        // Test resource() router helper
    }

    public function testMiddlewareAppliedInCorrectOrder(): void
    {
        // Test middleware chain
    }

    public function testRouteParamExtractionWorks(): void
    {
        // Test :userId, :id parameter binding
    }

    public function testNestedRouteGroupsWork(): void
    {
        // Test group() nesting
    }

    public function testUnknownRoutesReturn404(): void
    {
        // Test 404 handling
    }
}
```

##### `common/Tests/Feature/Api/CorsTest.php`
```php
class CorsTest extends Test
{
    public function testCorsHeadersSetForAllowedOrigins(): void
    {
        // Test CORS middleware
    }

    public function testPreflightRequestsHandled(): void
    {
        // Test OPTIONS method
    }

    public function testCorsBlocksUnauthorizedOrigins(): void
    {
        // Test origin validation
    }
}
```

##### `common/Tests/Feature/Api/CsrfProtectionTest.php`
```php
class CsrfProtectionTest extends Test
{
    public function testCsrfTokenGeneration(): void
    {
        // Test CSRF token creation
    }

    public function testCsrfTokenValidation(): void
    {
        // Test CrossSiteProtectionMiddleware
    }

    public function testCsrfInvalidTokenRejects(): void
    {
        // Test rejection on mismatch
    }

    public function testCsrfExemptEndpoints(): void
    {
        // Test GET/OPTIONS exemption
    }
}
```

##### `common/Tests/Feature/Api/ThrottlingTest.php`
```php
class ThrottlingTest extends Test
{
    public function testThrottleMiddlewareLimitsRequests(): void
    {
        // Test ThrottleMiddleware rate limiting
    }

    public function testThrottleReturns429AfterLimit(): void
    {
        // Test HTTP 429 Too Many Requests
    }

    public function testThrottleResetsAfterWindow(): void
    {
        // Test time window reset
    }
}
```

##### `common/Tests/Unit/Controllers/ResourceControllerTest.php`
```php
class ResourceControllerTest extends Test
{
    public function testGetRequestItemParsesData(): void
    {
        // Test helper method
    }

    public function testGetResourceIdExtractsId(): void
    {
        // Test ID extraction
    }

    public function testResponseWrapperFormatsCorrectly(): void
    {
        // Test $this->response()
    }

    public function testErrorResponseFormatsCorrectly(): void
    {
        // Test $this->error()
    }

    public function testValidationRulesApply(): void
    {
        // Test validateRules() method
    }
}
```

**Files to Test**:
- ✅ `public/api/index.php` (entry point)
- ✅ `Proto/Http/Router/Router.php` (routing logic)
- ✅ `Proto/Http/Middleware/CrossSiteProtectionMiddleware.php`
- ✅ `Proto/Http/Middleware/ThrottleMiddleware.php`
- ✅ `Proto/Http/Middleware/DomainMiddleware.php`
- ✅ `Proto/Controllers/ResourceController.php`

**Estimated Tests**: 20-25 test methods
**Estimated Time**: 2 days

---

### 4. Database Layer & ORM

**Why Critical**: Data persistence errors can cause data loss or corruption.

**Current State**: ❌ No tests found
**Risk Level**: 🟠 **HIGH**

#### Test Coverage Needed:

##### `common/Tests/Unit/Models/ModelRelationshipsTest.php`
```php
class ModelRelationshipsTest extends Test
{
    public function testHasOneRelationship(): void
    {
        // Test hasOne() lazy loading
    }

    public function testHasManyRelationship(): void
    {
        // Test hasMany() lazy loading
    }

    public function testBelongsToRelationship(): void
    {
        // Test belongsTo() lazy loading
    }

    public function testBelongsToManyRelationship(): void
    {
        // Test many-to-many with pivot
    }

    public function testEagerLoadingWithJoins(): void
    {
        // Test joins() static method
    }
}
```

##### `common/Tests/Unit/Storage/QueryBuilderTest.php`
```php
class QueryBuilderTest extends Test
{
    public function testWhereClauseBuilding(): void
    {
        // Test where() conditions
    }

    public function testOrderByClause(): void
    {
        // Test orderBy()
    }

    public function testGroupByClause(): void
    {
        // Test groupBy()
    }

    public function testLimitAndOffset(): void
    {
        // Test pagination
    }

    public function testJoinClauses(): void
    {
        // Test join() building
    }

    public function testParameterBinding(): void
    {
        // Test prepared statement binding
    }
}
```

##### `common/Tests/Feature/Database/TransactionTest.php`
```php
class TransactionTest extends Test
{
    public function testTransactionCommits(): void
    {
        // Test successful transaction
    }

    public function testTransactionRollsBackOnError(): void
    {
        // Test rollback on exception
    }

    public function testNestedTransactionsSavepoints(): void
    {
        // Test savepoint handling
    }
}
```

##### `common/Tests/Feature/Database/MigrationTest.php`
```php
class MigrationTest extends Test
{
    public function testMigrationRunsSuccessfully(): void
    {
        // Test migration execution
    }

    public function testMigrationRevertWorks(): void
    {
        // Test rollback
    }

    public function testMigrationTracksExecutedMigrations(): void
    {
        // Test migration history
    }
}
```

**Files to Test**:
- ✅ `Proto/Models/Model.php` (base model)
- ✅ `Proto/Storage/Storage.php` (base storage)
- ✅ `Proto/Database/QueryBuilder.php`
- ✅ `Proto/Database/Migrations/Guide.php`

**Estimated Tests**: 25-30 test methods
**Estimated Time**: 2-3 days

---

## 🔧 High Priority Areas (P1)

### 5. Email Dispatch System

**Current State**: ❌ No tests found
**Risk Level**: 🟡 **MEDIUM**

#### Test Coverage Needed:

##### `common/Tests/Unit/Email/EmailTemplateTest.php`
```php
class EmailTemplateTest extends Test
{
    public function testEmailTemplateRendering(): void
    {
        // Test Template::create()
    }

    public function testEmailTemplateVariableSubstitution(): void
    {
        // Test variable interpolation
    }

    public function testEmailTemplateInlinesCSS(): void
    {
        // Test CSS processing
    }
}
```

##### `common/Tests/Feature/Email/EmailDispatchTest.php`
```php
class EmailDispatchTest extends Test
{
    public function testEmailSendsViaSMTP(): void
    {
        // Test SMTP integration
    }

    public function testEmailFailsGracefully(): void
    {
        // Test error handling
    }

    public function testEmailQueuesForBackground(): void
    {
        // Test job queuing
    }

    public function testEmailLogsDelivery(): void
    {
        // Test audit trail
    }
}
```

**Files to Test**:
- ✅ `common/Email/Template.php`
- ✅ `common/Services/EmailService.php`
- ✅ `Proto/Dispatch/Dispatcher.php`

**Estimated Tests**: 10-12 test methods
**Estimated Time**: 1 day

---

### 6. Configuration & Environment Management

**Current State**: ❌ No tests found
**Risk Level**: 🟡 **MEDIUM**

#### Test Coverage Needed:

##### `common/Tests/Unit/Config/ConfigLoaderTest.php`
```php
class ConfigLoaderTest extends Test
{
    public function testJsonConfigParsing(): void
    {
        // Test common/Config/.env parsing
    }

    public function testEnvHelperReturnsValues(): void
    {
        // Test env() function
    }

    public function testConfigCaching(): void
    {
        // Test config caching mechanism
    }

    public function testMissingConfigReturnsDefault(): void
    {
        // Test fallback values
    }
}
```

##### `infrastructure/Tests/Scripts/SyncConfigTest.php`
```php
class SyncConfigTest extends Test
{
    public function testSyncConfigGeneratesEnvFile(): void
    {
        // Test sync-config.js functionality
    }

    public function testSyncConfigValidatesJsonInput(): void
    {
        // Test input validation
    }

    public function testSyncConfigOutputFormat(): void
    {
        // Test KEY=value format
    }
}
```

**Files to Test**:
- ✅ `common/Config/.env` (JSON parsing)
- ✅ `infrastructure/scripts/sync-config.js`
- ✅ Proto config helpers

**Estimated Tests**: 8-10 test methods
**Estimated Time**: 1 day

---

### 7. File Storage & Uploads

**Current State**: ❌ No tests found
**Risk Level**: 🟡 **MEDIUM**

#### Test Coverage Needed:

##### `common/Tests/Feature/Files/FileUploadTest.php`
```php
class FileUploadTest extends Test
{
    public function testFileUploadSucceeds(): void
    {
        // Test file upload to public/files
    }

    public function testFileUploadValidatesType(): void
    {
        // Test MIME type validation
    }

    public function testFileUploadValidatesSize(): void
    {
        // Test size limits
    }

    public function testFileUploadSanitizesFilename(): void
    {
        // Test filename security
    }

    public function testFileUploadCreatesDirectories(): void
    {
        // Test directory creation
    }
}
```

##### `common/Tests/Unit/Files/VaultTest.php`
```php
class VaultTest extends Test
{
    public function testVaultStoresFile(): void
    {
        // Test Vault::store()
    }

    public function testVaultRetrievesFile(): void
    {
        // Test Vault::retrieve()
    }

    public function testVaultDeletesFile(): void
    {
        // Test Vault::delete()
    }

    public function testVaultBucketIsolation(): void
    {
        // Test bucket separation
    }
}
```

**Files to Test**:
- ✅ `Proto/Utils/Files/Vault.php`
- ✅ File upload controllers

**Estimated Tests**: 10-12 test methods
**Estimated Time**: 1 day

---

## 🌐 Medium Priority Areas (P2)

### 8. Frontend Integration Tests

**Current State**: ❌ No tests found
**Risk Level**: 🟡 **MEDIUM**

#### Test Coverage Needed:

##### `apps/main/tests/auth.test.js` (JavaScript/Jest)
```javascript
describe('Authentication Flow', () => {
    test('login form submits correctly', async () => {
        // Test form submission
    });

    test('CSRF token included in requests', async () => {
        // Test CSRF middleware integration
    });

    test('auth state persists in localStorage', () => {
        // Test UserData model
    });

    test('expired session redirects to login', async () => {
        // Test session expiration handling
    });
});
```

##### `apps/crm/tests/user-management.test.js`
```javascript
describe('User Management', () => {
    test('user list loads paginated results', async () => {
        // Test API integration
    });

    test('user edit form validates', () => {
        // Test form validation
    });
});
```

**Coverage Areas**:
- ✅ API request handling (fetch wrappers)
- ✅ Authentication state management
- ✅ Form validation
- ✅ Routing (Base Framework router)

**Estimated Tests**: 15-20 test methods
**Estimated Time**: 2 days

---

### 9. Push Notifications & SMS

**Current State**: ⚠️ Partial (PushTest.php exists)
**Risk Level**: 🟢 **LOW**

#### Test Coverage Needed:

##### `common/Tests/Unit/Push/PushNotificationTest.php`
```php
class PushNotificationTest extends Test
{
    public function testPushNotificationCreation(): void
    {
        // Test Push::create()
    }

    public function testPushNotificationPayload(): void
    {
        // Test JSON structure
    }

    public function testPushNotificationTargeting(): void
    {
        // Test device targeting
    }
}
```

##### `common/Tests/Unit/Text/SMSTest.php`
```php
class SMSTest extends Test
{
    public function testSMSSendsViaTwilio(): void
    {
        // Test Twilio integration
    }

    public function testSMSFormatsMessage(): void
    {
        // Test message templating
    }

    public function testSMSValidatesPhoneNumber(): void
    {
        // Test phone validation
    }
}
```

**Files to Test**:
- ✅ `common/Push/Push.php`
- ✅ `common/Text/Text.php`
- ✅ SMS controllers

**Estimated Tests**: 8-10 test methods
**Estimated Time**: 1 day

---

## 📊 Implementation Strategy

### Phase 1: Security First (Week 1-2)
**Priority**: P0 - Authentication & Authorization
- Focus: Auth module tests (login, MFA, password reset)
- Target: 90%+ coverage of auth flows
- Goal: Eliminate security blind spots

### Phase 2: Core Functionality (Week 3-4)
**Priority**: P0 - User Management & API
- Focus: User CRUD, permissions, API routing
- Target: 80%+ coverage of critical paths
- Goal: Ensure business logic reliability

### Phase 3: Data Layer (Week 5)
**Priority**: P0 - Database & ORM
- Focus: Models, storage, query builder
- Target: 70%+ coverage of data layer
- Goal: Prevent data corruption

### Phase 4: Supporting Systems (Week 6-7)
**Priority**: P1 - Email, Config, Files
- Focus: Dispatch systems, configuration
- Target: 60%+ coverage of supporting services
- Goal: Ensure peripheral reliability

### Phase 5: Integration & Frontend (Week 8)
**Priority**: P2 - End-to-end flows
- Focus: Frontend tests, E2E scenarios
- Target: 50%+ coverage of user journeys
- Goal: Validate full-stack integration

---

## 🛠️ Testing Infrastructure Setup

### Required Tools

1. **PHPUnit** (already configured)
   ```bash
   # Run tests
   docker-compose exec web vendor/bin/phpunit

   # Run specific suite
   docker-compose exec web vendor/bin/phpunit --testsuite=Feature

   # With coverage
   docker-compose exec web vendor/bin/phpunit --coverage-html coverage/
   ```

2. **Test Database**
   - Create separate test database
   - Update `infrastructure/config/phpunit.xml`:
     ```xml
     <server name="DB_DATABASE" value="proto_test"/>
     ```

3. **Mock Services**
   - Email: `MAIL_MAILER=array` (already set)
   - SMS: Create Twilio mock
   - Push: Create push service mock

4. **Faker Integration**
   - Already available: `faker/faker`
   - Use for test data: `$this->fake()->name()`

### Test Directory Structure

```
common/
├── Tests/
│   ├── Unit/
│   │   ├── Auth/
│   │   ├── Config/
│   │   ├── Controllers/
│   │   ├── Email/
│   │   ├── Files/
│   │   ├── Models/
│   │   ├── Push/
│   │   ├── Storage/
│   │   └── Text/
│   └── Feature/
│       ├── Api/
│       ├── Database/
│       ├── Email/
│       └── Files/
modules/
├── Auth/
│   └── Tests/
│       ├── Unit/
│       └── Feature/
│           ├── LoginTest.php
│           ├── MultiFactorAuthTest.php
│           └── PasswordResetTest.php
├── User/
│   └── Tests/
│       ├── Unit/
│       │   ├── ConfirmPasswordTest.php (exists)
│       │   ├── UserRolesTest.php (exists)
│       │   ├── PermissionTest.php (new)
│       │   └── RoleManagementTest.php (new)
│       └── Feature/
│           ├── UserRegistrationTest.php
│           └── UserCRUDTest.php
apps/
├── main/tests/
├── crm/tests/
└── developer/tests/
```

---

## 📈 Success Metrics

### Coverage Targets

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| **Auth Module** | 0% | 90%+ | P0 |
| **User Module** | 5% | 85%+ | P0 |
| **API Layer** | 0% | 80%+ | P0 |
| **Database Layer** | 0% | 75%+ | P0 |
| **Email/SMS** | 0% | 70%+ | P1 |
| **Config** | 0% | 70%+ | P1 |
| **Files** | 0% | 65%+ | P1 |
| **Frontend** | 0% | 60%+ | P2 |
| **Overall** | ~5% | 75%+ | - |

### Quality Gates

Before merging any PR:
1. ✅ All tests pass
2. ✅ No new code without tests for critical paths
3. ✅ Code coverage doesn't decrease
4. ✅ No security tests skipped

### Continuous Integration

Add to CI/CD pipeline:
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: |
          docker-compose up -d
          docker-compose exec -T web vendor/bin/phpunit
      - name: Check Coverage
        run: |
          docker-compose exec -T web vendor/bin/phpunit --coverage-text
```

---

## 🎓 Testing Best Practices

### 1. **Use Seeders for Test Data**
```php
class UserServiceTest extends Test
{
    protected array $seeders = [RoleSeeder::class];

    public function testUserCreation(): void
    {
        // Seeders auto-run before each test
        $adminRole = Role::where('slug', 'admin')->first();
        // ...
    }
}
```

### 2. **Mock External Services**
```php
public function testEmailSending(): void
{
    $emailService = $this->mockService(EmailService::class);
    $this->expectMethodCall($emailService, 'send', ['user@example.com']);

    // Test code...
}
```

### 3. **Test Edge Cases**
- Empty inputs
- Maximum values
- Boundary conditions
- Invalid data types
- SQL injection attempts
- XSS payloads

### 4. **Descriptive Test Names**
```php
// ❌ Bad
public function testUser(): void

// ✅ Good
public function testUserRegistrationFailsWithDuplicateEmail(): void
```

### 5. **Arrange-Act-Assert Pattern**
```php
public function testUserLogin(): void
{
    // Arrange
    $user = User::factory()->create();

    // Act
    $response = $this->postJson('/api/auth/login', [
        'username' => $user->email,
        'password' => 'password'
    ]);

    // Assert
    $response->assertStatus(200);
    $response->assertJsonStructure(['token', 'user']);
}
```

---

## 💰 Resource Estimation

### Development Time

| Phase | Component | Estimated Time | Tests Count |
|-------|-----------|----------------|-------------|
| Phase 1 | Auth & Security | 2-3 days | 25-30 |
| Phase 2a | User Management | 2 days | 20-25 |
| Phase 2b | API Layer | 2 days | 20-25 |
| Phase 3 | Database Layer | 2-3 days | 25-30 |
| Phase 4a | Email/SMS | 1 day | 10-12 |
| Phase 4b | Config/Files | 1-2 days | 15-20 |
| Phase 5 | Frontend | 2 days | 15-20 |
| **Total** | - | **12-15 days** | **130-162 tests** |

### Maintenance Overhead

- **Weekly**: Review failed tests, update fixtures
- **Per PR**: Write tests for new features
- **Monthly**: Review coverage reports, identify gaps
- **Quarterly**: Refactor brittle tests

---

## 🚀 Quick Start Commands

```bash
# Create test directory structure
mkdir -p modules/Auth/Tests/{Unit,Feature}
mkdir -p common/Tests/{Unit,Feature}/{Api,Database,Email,Files}

# Run all tests
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit

# Run specific test suite
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --testsuite=Feature

# Run specific test file
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit modules/Auth/Tests/Feature/LoginTest.php

# Generate coverage report (HTML)
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --coverage-html coverage/

# Watch tests (requires phpunit-watcher)
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit-watcher watch

# Run tests with verbose output
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/phpunit --verbose

# Run tests in parallel (requires paratest)
docker-compose -f infrastructure/docker-compose.yaml exec web vendor/bin/paratest
```

---

## 📚 Additional Resources

- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Proto Framework Testing Guide](apps/developer/src/components/pages/documentation/tests/)
- [Testing Best Practices](https://martinfowler.com/testing/)
- [Test-Driven Development (TDD)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

## 🎯 Summary

**Immediate Actions**:
1. ✅ Start with Auth module tests (security-critical)
2. ✅ Set up test database and fixtures
3. ✅ Create mock services for external APIs
4. ✅ Add CI/CD pipeline for automated testing

**Expected Outcomes**:
- 🔒 **Security**: 90%+ coverage of authentication flows
- 🐛 **Quality**: Catch bugs before production
- 📈 **Confidence**: Deploy with assurance
- 🔄 **Refactoring**: Safely improve code
- 📚 **Documentation**: Tests as executable specs

**Timeline**: 12-15 days for comprehensive coverage across critical systems

---

*This proposal is a living document. Update as tests are implemented and new areas are identified.*

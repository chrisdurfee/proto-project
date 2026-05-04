---
description: "Use when writing or editing Proto Framework migration files - covers timestamp filename convention (YYYY-MM-DDTHH.MM.SS.MICROSECONDS_ClassName.php), class extending Proto\\Database\\Migrations\\Migration with up()/down(), full field type catalog (id, uuid, integer types, decimal, varchar, text, blob, date, datetime, enum, json, point), field modifiers (nullable, default, currentTimestamp, after), audit fields (timestamps, deletedAt), indexes, foreign keys (foreign() not foreignKey/foreignId), alter tables with $table->alter('col')->type() pattern (no modifyColumn), snake_case-only column names, and 64-char FK constraint limit"
applyTo: "{modules/**/Migrations/*.php,common/**/Migrations/*.php}"
---

# Proto Migrations

## Naming Convention (CRITICAL)
- **Filename**: `YYYY-MM-DDTHH.MM.SS.MICROSECONDS_ClassName.php`
- **Class Name**: Must match the portion AFTER the underscore
- **Example**: `2026-01-21T04.14.30.800125_Event.php` → `class Event`
- **NOT Laravel style**: Don't use `CreateEventsTable.php`

Generate timestamp: `date +"%Y-%m-%dT%H.%M.%S.%6N"`

## Structure

```php
<?php declare(strict_types=1);

use Proto\Database\Migrations\Migration;

class CarMaintenanceRecord extends Migration
{
    public function up(): void
    {
        $this->create('car_maintenance_records', function($table)
        {
            $table->id();
            $table->uuid();
            $table->integer('car_profile_id', 30);
            $table->integer('user_id', 30);
            $table->varchar('title', 200);
            $table->text('description')->nullable();
            $table->enum('type', 'routine', 'repair', 'inspection')->default("'routine'");
            $table->date('service_date');
            $table->decimal('cost', 10, 2)->nullable();
            $table->createdAt();
            $table->integer('created_by', 30)->nullable();
            $table->updatedAt();
            $table->integer('updated_by', 30)->nullable();
            $table->deletedAt();

            $table->index('car_profile_idx')->fields('car_profile_id', 'service_date');
            $table->index('user_idx')->fields('user_id');
            $table->foreign('car_profile_id')->references('id')->on('car_profiles')->onDelete('CASCADE');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
        });
    }

    public function down(): void
    {
        $this->drop('car_maintenance_records');
    }
}
```

## Field Types

**Primary Keys & IDs**:
- `$table->id(length = 30)` — INT primary key with auto increment
- `$table->uuid(length = 36)` — VARCHAR UUID field with unique index

**Integer Types**:
- `$table->tinyInteger(length = 1)` — TINYINT (1 byte, -128 to 127)
- `$table->boolean()` — Alias for tinyInteger, use for true/false
- `$table->smallInteger(length)` — SMALLINT (2 bytes)
- `$table->mediumInteger(length)` — MEDIUMINT (3 bytes)
- `$table->integer(length)` or `$table->int(length)` — INT (4 bytes)
- `$table->bigInteger(length)` — BIGINT (8 bytes)

**Decimal & Float**: `$table->decimal(length)`, `$table->floatType(length)`, `$table->doubleType(length)`

**Strings**: `$table->char(length)`, `$table->varchar(length)`

**Text**: `$table->tinyText()`, `$table->text()`, `$table->mediumText()`, `$table->longText()`

**Binary**: `$table->binary(length)`, `$table->bit()`, `$table->tinyBlob()`, `$table->blob(length)`, `$table->mediumBlob(length)`, `$table->longBlob(length)`

**Date/Time**: `$table->date()`, `$table->datetime()`, `$table->timestamp()`

**Special**: `$table->enum('field', 'val1', 'val2')`, `$table->json()`, `$table->point()`

### NEVER use `$table->raw('column TYPE ...')` for column definitions

The schema builder has **no `raw()` column method**. Calls go through `__call`, which tries to invoke `raw` on a freshly-created `CreateField` named after the first argument. Since `CreateField::raw()` doesn't exist, the field is silently removed and **the column is never created**. The migration appears to succeed but the column is missing — runtime queries then fail with `Unknown column '...'`.

```php
// ❌ WRONG — column silently dropped, never created
$table->raw('coordinates POINT NULL');

// ✅ CORRECT — use the typed builder
$table->point('coordinates')->nullable();
```

`$table->raw(...)` IS valid for emitting raw clauses that aren't column definitions, like spatial indexes, where there's no typed builder:
```php
$table->raw('SPATIAL INDEX coordinates_idx (coordinates)');
```

**Field Modifiers**:
- `->nullable()` — Allow NULL values
- `->default(value)` — Set default value
- `->currentTimestamp()` — Default to CURRENT_TIMESTAMP
- `->utcTimestamp()` — Default to UTC_TIMESTAMP
- `->primary()` — Set as primary key
- `->autoIncrement()` — Enable auto increment
- `->after('field')` — Position after specified field
- `->rename('newName')` — Rename field

**Audit Fields**: `$table->timestamps()` (created_at + updated_at), `$table->createdAt()`, `$table->updatedAt()`, `$table->deletedAt()`

**Indexes**:
- `$table->index('idx_name')->fields('field1', 'field2')`
- `$table->unique('unq_name')->fields('field1')`

**Foreign Keys**: `$table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE')`

## Alter Tables

```php
$this->alter('table_name', function($table)
{
    $table->rename('new_name');       // rename table
    $table->engine('InnoDB');

    $table->add('status')->int(20);   // add new field
    $table->int('status', 20);        // shorthand add
    $table->alter('subject')->varchar(180); // modify existing field
    $table->drop('read_at');          // drop field

    $table->index('idx_new')->fields('user_id', 'created_at');
    $table->dropIndex('idx_old');

    $table->foreign('user_id')->references('id')->on('users')->onDelete('CASCADE');
    $table->dropForeignKey('fk_user_id');
});
```

### Modify Existing Column (e.g. extend an enum)

Use `$table->alter('column_name')` — there is NO `modifyColumn()` method.

```php
// ✅ CORRECT — alter existing enum to add values
$this->alter('post_reports', function($table)
{
    $table->alter('item_type')->enum('post', 'group_post', 'drive_review')
        ->default("'post'");
});

// ❌ WRONG — modifyColumn() does not exist
$table->modifyColumn()->enum('item_type', 'post', 'group_post', 'drive_review');
```

When using `$table->alter('col')`, the column name is the argument to `alter()`, NOT the first argument to the type method. Compare:
- **Add new column**: `$table->enum('item_type', 'val1', 'val2')` — column name is first arg
- **Modify existing column**: `$table->alter('item_type')->enum('val1', 'val2')` — column name is in `alter()`

## CRITICAL Rules

- Extend `Proto\Database\Migrations\Migration`
- Use `up()` and `down()` NOT `run()` and `revert()`
- Use `foreign()` NOT `foreignKey()` or `foreignId()`
- **ALL migration column names must be snake_case** — ORM converts camelCase `$fields` to snake_case automatically
  ```php
  // ✅ CORRECT — snake_case in migration
  $table->integer('user_id', 30);
  $table->varchar('step_key', 50);
  $table->datetime('occurred_at');

  // ❌ WRONG — camelCase in migration
  $table->integer('userId', 30);
  ```
- **Audit columns are snake_case in DB** — `timestamps()`, `createdAt()`, `updatedAt()`, `deletedAt()` create `created_at`, `updated_at`, `deleted_at`. Use snake_case in index fields:
  ```php
  // ✅ CORRECT
  $table->index('idx_user_created')->fields('user_id', 'created_at');
  // ❌ WRONG
  $table->index('idx_user_created')->fields('user_id', 'createdAt');
  ```
- **FK constraint names have a 64-character MySQL limit** — Proto auto-generates: `fk_{table}_{col}_{ref_table}_{ref_col}`. Calculate length before adding. Shorten source table name if needed.
- DO NOT specify `$connection` unless non-default DB
- Migrations discovered recursively from `modules/*/Migrations` up to 6 levels deep

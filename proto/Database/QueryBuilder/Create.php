<?php declare(strict_types=1);
namespace Proto\Database\QueryBuilder;

/**
 * Create
 *
 * This class handles CREATE TABLE queries.
 *
 * @package Proto\Database\QueryBuilder
 */
class Create extends Blueprint
{
	/**
	 * The list of fields.
	 *
	 * @var array<int, CreateField|string>
	 */
	protected array $fields = [];

	/**
	 * The list of indices.
	 *
	 * @var array<int, CreateIndex>
	 */
	protected array $indices = [];

	/**
	 * The list of foreign keys.
	 *
	 * @var array<int, CreateForeignKey>
	 */
	protected array $foreign = [];

	/**
	 * The table engine.
	 *
	 * @var string
	 */
	protected string $engine = 'InnoDB';

	/**
	 * Sets the table engine.
	 *
	 * @param string $engine The engine to use.
	 * @return self
	 */
	public function engine(string $engine): self
	{
		$this->engine = $engine;
		return $this;
	}

	/**
	 * Sets the table engine to MyISAM.
	 *
	 * @return self
	 */
	public function myisam(): self
	{
		return $this->engine('MyISAM');
	}

	/**
	 * Inserts data into the table.
	 *
	 * @param array|object|null $data The data to insert.
	 * @return self
	 */
	public function create(array|object|null $data = null): self
	{
		if ($data === null)
		{
			return $this;
		}

		$dataArray = is_object($data) ? (array)$data : $data;
		foreach ($dataArray as $key => $value)
		{
			$this->fields[] = "{$key} = {$value}";
		}
		return $this;
	}

	/**
	 * Adds a field.
	 *
	 * @param string $name The name of the field.
	 * @return CreateField
	 */
	protected function createField(string $name): CreateField
	{
		$field = new CreateField($name);
		$this->fields[] = $field;
		return $field;
	}

	/**
	 * Creates an ID field.
	 *
	 * @param int $length The length of the ID field.
	 * @return CreateField
	 */
	public function id(int $length = 30): CreateField
	{
		$field = $this->createField('id');
		$field->int($length)->primary()->autoIncrement();
		return $field;
	}

	/**
	 * Creates a UUID field.
	 *
	 * @param int $length The length of the uuid field.
	 * @return CreateField
	 */
	public function uuid(int $length = 36): CreateField
	{
		$field = $this->createField('uuid');
		$field->varchar($length)->default("UUID()");

		$this->unique('users_uuid_unique')
    		->fields('uuid');

		return $field;
	}

	/**
	 * Adds a datetime field.
	 *
	 * @param string $name The name of the datetime field.
	 * @return CreateField
	 */
	protected function addDateTime(string $name): CreateField
	{
		$field = $this->createField($name);
		$field->datetime();
		return $field;
	}

	/**
	 * Adds a created_at datetime field.
	 *
	 * @return CreateField
	 */
	public function createdAt(): CreateField
	{
		return $this->addDateTime('created_at')->currentTimestamp();
	}

	/**
	 * Adds an updated_at datetime field.
	 *
	 * @return CreateField
	 */
	public function updatedAt(): CreateField
	{
		return $this->addDateTime('updated_at')->nullable();
	}

	/**
	 * Adds a deleted_at datetime field.
	 *
	 * @return CreateField
	 */
	public function deletedAt(): CreateField
	{
		return $this->addDateTime('deleted_at')->nullable();
	}

	/**
	 * Adds a created_by int field and foreign key to the users table.
	 *
	 * @param int $length The length of the created_by field.
	 * @return CreateField
	 */
	public function createdBy(int $length = 30): CreateField
	{
		$field = $this->createField('created_by');
		$field->int($length)->nullable();

		$this->foreign('created_by')
				  ->references('id')
				  ->on('users')
				  ->onDelete('cascade');

		return $field;
	}

	/**
	 * Adds a updated_by int field and foreign key to the users table.
	 *
	 * @param int $length The length of the updated_by field.
	 * @return CreateField
	 */
	public function updatedBy(int $length = 30): CreateField
	{
		$field = $this->createField('updated_by');
		$field->int($length)->nullable();

		$this->foreign('updated_by')
				  ->references('id')
				  ->on('users')
				  ->onDelete('cascade');

		return $field;
	}

	/**
	 * Adds a deleted_by int field and foreign key to the users table.
	 *
	 * @param int $length The length of the deleted_by field.
	 * @return CreateField
	 */
	public function deletedBy(int $length = 30): CreateField
	{
		$field = $this->createField('deleted_by');
		$field->int($length)->nullable();

		$this->foreign('deleted_by')
				  ->references('id')
				  ->on('users')
				  ->onDelete('cascade');

		return $field;
	}

	/**
	 * Adds a author_id int field and foreign key to the users table.
	 *
	 * @param int $length The length of the author_id field.
	 * @return CreateField
	 */
	public function authorId(int $length = 30): CreateField
	{
		$field = $this->createField('author_id');
		$field->int($length)->nullable();

		$this->foreign('author_id')
				  ->references('id')
				  ->on('users')
				  ->onDelete('cascade');

		return $field;
	}

	/**
	 * Adds the timestamp fields.
	 *
	 * @return void
	 */
	public function timestamps(): void
	{
		$this->createdAt();
		$this->updatedAt();
	}

	/**
	 * Removes a field.
	 *
	 * @param object $field The field to remove.
	 * @return self
	 */
	public function removeField(object $field): self
	{
		$index = array_search($field, $this->fields, true);
		if ($index !== false)
		{
			array_splice($this->fields, $index, 1);
		}
		return $this;
	}

	/**
	 * Magic method to pass calls to a child field.
	 *
	 * @param string $method The method name.
	 * @param array $arguments The method arguments.
	 * @return mixed
	 */
	public function __call(string $method, array $arguments): mixed
	{
		$field = $this->createField($arguments[0]);
		$callable = [$field, $method];
		if (!is_callable($callable))
		{
			$this->removeField($field);
			return null;
		}
		$args = array_slice($arguments, 1);
		return call_user_func_array($callable, $args);
	}

	/**
	 * Creates an index.
	 *
	 * @param string $name The name of the index.
	 * @return CreateIndex
	 */
	public function index(string $name): CreateIndex
	{
		$index = new CreateIndex($name);
		$this->indices[] = $index;
		return $index;
	}

	/**
	 * Creates a unique index.
	 *
	 * @param string $name The name of the unique index.
	 * @return CreateIndex
	 */
	public function unique(string $name): CreateIndex
	{
		$index = new CreateIndex($name);
		$index->unique();
		$this->indices[] = $index;
		return $index;
	}

	/**
	 * Creates a foreign key.
	 *
	 * @param string $field The field for the foreign key.
	 * @return CreateForeignKey
	 */
	public function foreign(string $field): CreateForeignKey
	{
		$foreignKey = new CreateForeignKey($field);
		$this->foreign[] = $foreignKey;
		return $foreignKey;
	}

	/**
	 * Joins an array into a comma-separated string with an optional prefix.
	 *
	 * @param string $prefix The prefix text.
	 * @param array $array The array to join.
	 * @return string The resulting string.
	 */
	protected function addCommaToString(string $prefix, array $array): string
	{
		if (empty($array))
		{
			return '';
		}
		$result = $prefix !== '' ? ', ' : '';
		$result .= implode(', ', $array);
		return $result;
	}

	/**
	 * Renders the CREATE TABLE query.
	 *
	 * @return string The rendered SQL query.
	 */
	public function render(): string
	{
		$fields = implode(', ', $this->fields);
		$indices = $this->addCommaToString($fields, $this->indices);
		$foreign = $this->addCommaToString($fields, $this->foreign);
		return "CREATE TABLE IF NOT EXISTS {$this->tableName} ({$fields}{$indices}{$foreign}) COLLATE='utf8mb4_unicode_ci' ENGINE={$this->engine};";
	}
}
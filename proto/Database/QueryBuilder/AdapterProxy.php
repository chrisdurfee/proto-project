<?php declare(strict_types=1);
namespace Proto\Database\QueryBuilder;

use Proto\Database\Adapters\Adapter;
use Proto\Database\QueryBuilder\Select;
use Proto\Database\QueryBuilder\Insert;
use Proto\Database\QueryBuilder\Replace;
use Proto\Database\QueryBuilder\Update;
use Proto\Database\QueryBuilder\Delete;

/**
 * AdapterProxy
 *
 * Adds adapter functionality to the query builder.
 *
 * @mixin Select
 * @mixin Insert
 * @mixin Replace
 * @mixin Update
 * @mixin Delete
 * @package Proto\Database\QueryBuilder
 */
class AdapterProxy
{
	/**
	 * Constructor.
	 *
	 * @param object $sql The SQL component.
	 * @param Adapter|null $db The database adapter.
	 * @return void
	 */
	public function __construct(protected ?object $sql, protected ?Adapter $db = null)
	{
	}

	/**
	 * Magic method to handle dynamic method calls.
	 *
	 * Checks if the method is callable on the SQL object and calls it,
	 * returning the proxy for chaining.
	 *
	 * @param string $method The method name.
	 * @param array $arguments The method arguments.
	 * @return mixed
	 */
	public function __call(string $method, array $arguments): mixed
	{
		if (!$this->isCallable($this->sql, $method))
		{
			return $this;
		}

		\call_user_func_array([$this->sql, $method], $arguments);
		return $this;
	}

	/**
	 * Checks if a method is callable on a given object.
	 *
	 * @param object $object The object to check.
	 * @param string $method The method name.
	 * @return bool
	 */
	protected function isCallable(object $object, string $method): bool
	{
		return \is_callable([$object, $method]);
	}

	/**
	 * Converts the SQL object to a string.
	 *
	 * @return string
	 */
	public function __toString(): string
	{
		return (string) $this->sql;
	}

	/**
	 * Checks if the adapter is set.
	 *
	 * @return bool
	 */
	protected function hasAdapter(): bool
	{
		return $this->db !== null;
	}

	/**
	 * Executes a query using the adapter.
	 *
	 * @param array $params The query parameters.
	 * @return bool
	 */
	public function execute(array $params = []): bool
	{
		if ($this->hasAdapter() === false)
		{
			return false;
		}

		return $this->db->execute((string) $this->sql, $params);
	}

	/**
	 * Executes a transaction using the adapter.
	 *
	 * @param array $params The transaction parameters.
	 * @return bool
	 */
	public function transaction(array $params = []): bool
	{
		if ($this->hasAdapter() === false)
		{
			return false;
		}

		return $this->db->transaction((string) $this->sql, $params);
	}

	/**
	 * Fetches data using the adapter.
	 *
	 * @param array $params The query parameters.
	 * @return array
	 */
	public function fetch(array $params = []): array
	{
		if ($this->hasAdapter() === false)
		{
			return [];
		}

		return $this->db->fetch((string) $this->sql, $params);
	}

	/**
	 * Fetches the rows from the adapter.
	 *
	 * @param array $params The query parameters.
	 * @return array
	 */
	public function rows(array $params = []): array
	{
		if ($this->hasAdapter() === false)
		{
			return [];
		}

		return $this->fetch($params) ?? [];
	}

	/**
	 * Fetches the first row from the adapter.
	 *
	 * @param array $params The query parameters.
	 * @return object|null
	 */
	public function first(array $params = []): ?object
	{
		if ($this->hasAdapter() === false)
		{
			return null;
		}

		$this->sql->limit(1);
		return $this->db->first((string) $this->sql, $params);
	}

	/**
	 * Add a JSON condition to the WHERE clause for a join, binding $params by reference.
	 *
	 * @param string $columnName The JSON column (e.g. "ou.organizations").
	 * @param mixed $value The value to encode (will become {"id":…} or similar).
	 * @param array<string> & $params The binding array that gets appended.
	 * @param string $path The JSON path, default '$'.
	 * @return self
	 */
	public function whereJoin(
		string $columnName,
		mixed $value,
		array &$params,
		string $path = '$'
	): self
	{
		$this->sql->whereJoin($columnName, $value, $params, $path);
		return $this;
	}
}
<?php declare(strict_types=1);

namespace Common\Gateways\Concerns;

/**
 * LazyGatewayTrait
 *
 * Memoized child gateway / service resolution, keyed on class name plus
 * constructor arguments. Mirrors Proto\Module\Traits\LazyGatewayTrait so
 * facade gateways (no single primary model) can memoize their children too.
 *
 * Prefer this Common copy for facade gateways. Proto\Module\Gateway still
 * uses the proto trait for model-backed gateways.
 *
 * @package Common\Gateways\Concerns
 */
trait LazyGatewayTrait
{
	/**
	 * Memoized child gateway / service instances.
	 *
	 * @var array<string, object>
	 */
	private array $lazyGatewayInstances = [];

	/**
	 * Return a memoized instance of a child gateway or service.
	 *
	 * Keyed on class + constructor args. Different args get different
	 * instances; do not pass a different arg and expect the same object.
	 *
	 * @template T of object
	 * @param class-string<T> $class
	 * @param mixed ...$constructorArgs
	 * @return T
	 */
	protected function gateway(string $class, mixed ...$constructorArgs): object
	{
		$key = $class;
		if ($constructorArgs !== [])
		{
			$key .= ':' . md5(serialize($constructorArgs));
		}

		if (!isset($this->lazyGatewayInstances[$key]))
		{
			$this->lazyGatewayInstances[$key] = new $class(...$constructorArgs);
		}

		/** @var T $instance */
		$instance = $this->lazyGatewayInstances[$key];
		return $instance;
	}
}

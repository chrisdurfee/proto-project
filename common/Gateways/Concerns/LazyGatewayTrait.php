<?php declare(strict_types=1);

namespace Common\Gateways\Concerns;

/**
 * LazyGatewayTrait
 *
 * Memoizes sub-gateway and service instances so that anemic accessors
 * such as `Gateway::view()` stop returning a brand-new gateway on every
 * call. The framework re-instantiates the top-level module gateway on
 * each `modules()->x()` lookup, but within a single chain (or any code
 * that holds on to the parent gateway), repeat accesses now reuse the
 * same child instance.
 *
 * Usage:
 * ```php
 * class Gateway
 * {
 *     use LazyGatewayTrait;
 *
 *     public function view(): ViewGateway
 *     {
 *         return $this->gateway(ViewGateway::class);
 *     }
 *
 *     public function comment(): CommentGateway
 *     {
 *         return $this->gateway(CommentGateway::class);
 *     }
 * }
 * ```
 *
 * @package Common\Gateways\Concerns
 */
trait LazyGatewayTrait
{
	/**
	 * Cached gateway / service instances keyed by fully-qualified class
	 * name. Each entry is created on first access by {@see gateway()}.
	 *
	 * @var array<class-string, object>
	 */
	private array $lazyGatewayInstances = [];

	/**
	 * Return a memoized instance of the requested gateway / service
	 * class. Constructor arguments are supported for the first call only
	 * — subsequent calls return the cached instance regardless of the
	 * arguments supplied.
	 *
	 * @template T of object
	 * @param class-string<T> $class
	 * @param mixed ...$constructorArgs
	 * @return T
	 */
	protected function gateway(string $class, mixed ...$constructorArgs): object
	{
		if (!isset($this->lazyGatewayInstances[$class]))
		{
			$this->lazyGatewayInstances[$class] = new $class(...$constructorArgs);
		}

		/** @var T $instance */
		$instance = $this->lazyGatewayInstances[$class];
		return $instance;
	}
}

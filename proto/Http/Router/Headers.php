<?php declare(strict_types=1);
namespace Proto\Http\Router;

/**
 * Headers
 *
 * Handles HTTP headers.
 *
 * @package Proto\Http\Router
 */
class Headers
{
	/**
	 * Default headers definition.
	 *
	 * @var array<string,string|null>
	 */
	protected static array $defaultHeaders =
	[
		'Access-Control-Allow-Origin' => '*',
		'Access-Control-Allow-Headers' => '*',
		'Access-Control-Allow-Methods' => null, // placeholder
		'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0'
	];

	/**
	 * Convert the methods array to a comma-separated string.
	 *
	 * @param array<string> $methods
	 * @return string
	 */
	protected static function convertMethodsToString(array $methods): string
	{
		return implode(', ', $methods);
	}

	/**
	 * Prepare the headers array for a given set of allowed methods.
	 *
	 * @param array<string> $methods
	 * @return array<string,string>
	 */
	protected static function prepare(array $methods): array
	{
		$headers = self::$defaultHeaders;
		$headers['Access-Control-Allow-Methods'] = self::convertMethodsToString($methods);
		return $headers;
	}

	/**
	 * Render (send) all headers in the given array.
	 *
	 * @param array<string,string> $headers
	 * @return void
	 */
	public static function render(array $headers): void
	{
		foreach ($headers as $name => $value)
		{
			header("{$name}: {$value}");
		}
	}

	/**
	 * Public entry point: set up and send all standard headers.
	 *
	 * @param array<string> $methods Allowed HTTP methods.
	 * @return void
	 */
	public static function set(array $methods): void
	{
		$headers = self::prepare($methods);
		self::render($headers);
	}
}

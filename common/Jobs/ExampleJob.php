<?php declare(strict_types=1);
namespace Common\Jobs;

/**
 * ExampleJob
 *
 * An example job class demonstrating the job structure.
 *
 * @package Common\Jobs
 */
class ExampleJob
{
	/**
	 * Handles the job processing.
	 *
	 * @param mixed $data
	 * @return mixed
	 */
	public function handle(mixed $data): mixed
	{
		// Job processing logic goes here
		return false;
	}
}
<?php declare(strict_types=1);
namespace Proto\Generators;

use Proto\Utils\Files\File;
use Proto\Utils\Strings;

/**
 * Abstract File Generator
 *
 * This class provides common methods for file generators.
 *
 * @package Proto\Generators
 * @abstract
 */
abstract class AbstractFileGenerator implements FileGeneratorInterface
{
	/**
	 * Saves a file.
	 *
	 * @param string $dir Directory path.
	 * @param string $fileName File name.
	 * @param mixed $content File content.
	 * @return bool True on success, false if the file already exists.
	 */
	protected function saveFile(string $dir, string $fileName, mixed $content): bool
	{
		$path = $this->convertSlashes(strtolower($dir) . '/' . $fileName);
		if (file_exists($path))
        {
			return false;
		}
		File::put($path, (string)$content);
		return true;
	}

	/**
	 * Gets a file name.
	 *
	 * @param string $str The base string.
	 * @return string The generated file name.
	 */
	protected function getFileName(string $str): string
	{
		return Strings::pascalCase($str) . '.php';
	}

	/**
	 * Converts slashes in a path.
	 *
	 * @param string $path The path to convert.
	 * @return string The converted path.
	 */
	protected function convertSlashes(string $path): string
	{
		return str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
	}

	/**
	 * Gets the full directory path for a module.
	 *
	 * @param string $module The module name.
	 * @return string The full directory path.
	 */
	protected function getModuleDir(string $module): string
	{
		switch (strtolower($module))
		{
			case 'common':
				return realpath(__DIR__ . '/../../common');
			case 'proto':
				return realpath(__DIR__ . '/../../proto');
			default:
				return (realpath(__DIR__ . '/../../modules') . DIRECTORY_SEPARATOR . $module);
		}
	}

	/**
	 * Returns the full directory path where the file should be saved.
	 *
	 * This method must be implemented in the concrete file generator.
	 *
	 * @param string $dir A relative directory name.
	 * @param string $module The module name.
	 * @return string The full directory path.
	 */
	abstract protected function getDir(string $dir, string $module): string;
}

<?php declare(strict_types=1);
namespace Proto\Generators\FileTypes;

use Proto\Generators\AbstractFileGenerator;
use Proto\Generators\Templates;
use Proto\Utils\Strings;

/**
 * ModelGenerator
 *
 * Generates model files based on the provided settings.
 *
 * @package Proto\Generators\FileTypes
 */
class ModelGenerator extends AbstractFileGenerator
{
	/**
	 * Generates a model file.
	 *
	 * @param object $settings The settings for the model file generation.
	 * @return bool True on success, false otherwise.
	 */
	public function generate(object $settings): bool
	{
		$dir = $this->getDir($settings->dir, $settings->moduleName);
		$fileName = $this->getFileName($settings->className);
		$template = new Templates\ModelTemplate($settings);
		return $this->saveFile($dir, $fileName, $template);
	}

	/**
	 * Returns the full directory path where the API resource file should be saved.
	 *
	 * @param string $dir The relative directory.
	 * @param string $module The module name.
	 * @return string The full directory path.
	 */
	protected function getDir(string $dir, string $module): string
	{
		$dir = str_replace('\\', '/', $dir);
		$moduleDir = $this->getModuleDir($module);
		return $moduleDir . DIRECTORY_SEPARATOR . $this->convertSlashes($dir);
	}
}
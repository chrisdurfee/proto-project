<?php declare(strict_types=1);

/**
 * orhanerday/open-ai 5.3 calls curl_close(), which is deprecated since PHP 8.0
 * (no-op since then). Upstream has not shipped a release without it.
 *
 * Remove the call so OpenAI requests stop generating deprecation notices in
 * logs. Safe to re-run. Applied at image build and container start.
 *
 * Usage:
 *   php infrastructure/scripts/patch-openai-curl-close.php [path-to-OpenAi.php]
 */

$path = $argv[1] ?? (dirname(__DIR__, 2) . '/vendor/orhanerday/open-ai/src/OpenAi.php');

if (!is_file($path))
{
	fwrite(STDERR, "OpenAi.php not found: {$path}\n");
	exit(1);
}

$contents = file_get_contents($path);
if ($contents === false)
{
	fwrite(STDERR, "Failed to read: {$path}\n");
	exit(1);
}

if (!str_contains($contents, 'curl_close('))
{
	fwrite(STDOUT, "Already patched (no curl_close): {$path}\n");
	exit(0);
}

// Match the library's sendRequest() cleanup line (spaces, optional semicolon).
$patched = preg_replace(
	'/^[ \t]*curl_close\(\s*\$curl\s*\)\s*;\s*\n/m',
	'',
	$contents,
	1,
	$count
);

if ($count < 1 || $patched === null)
{
	fwrite(STDERR, "curl_close(\$curl) not found in expected form: {$path}\n");
	exit(1);
}

if (file_put_contents($path, $patched) === false)
{
	fwrite(STDERR, "Failed to write: {$path}\n");
	exit(1);
}

fwrite(STDOUT, "Patched curl_close from: {$path}\n");
exit(0);

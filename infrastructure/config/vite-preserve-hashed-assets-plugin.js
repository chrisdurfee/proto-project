/**
 * Keep the previous deploy's content-hashed assets on disk.
 *
 * Vite's `emptyOutDir` wipes `assets/` on every build. A tab that is
 * still running the last shell then lazy-imports a chunk that no
 * longer exists and 404s. Copying the prior hashed files back after
 * the new build (and pruning ones older than two weeks) lets those
 * in-flight sessions finish loading while new visitors get the new
 * hashes from index.html.
 *
 * Snapshot happens in `config` so it runs before Vite empties outDir.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * @type {number}
 */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Copy a file and keep its original mtime so prune can expire it.
 *
 * @param {string} source
 * @param {string} dest
 * @returns {void}
 */
const copyFileKeepMtime = (source, dest) =>
{
	const stat = fs.statSync(source);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(source, dest);
	fs.utimesSync(dest, stat.atime, stat.mtime);
};

/**
 * Recursively copy a directory, preserving mtimes.
 *
 * @param {string} source
 * @param {string} dest
 * @returns {void}
 */
const copyDirKeepMtime = (source, dest) =>
{
	fs.mkdirSync(dest, { recursive: true });

	for (const entry of fs.readdirSync(source, { withFileTypes: true }))
	{
		const from = path.join(source, entry.name);
		const to = path.join(dest, entry.name);

		if (entry.isDirectory())
		{
			copyDirKeepMtime(from, to);
			continue;
		}

		copyFileKeepMtime(from, to);
	}
};

/**
 * Restore snapshot files that the new build did not emit.
 *
 * @param {string} snapshotDir
 * @param {string} assetsDir
 * @returns {number}
 */
const restoreMissing = (snapshotDir, assetsDir) =>
{
	if (fs.existsSync(snapshotDir) === false)
	{
		return 0;
	}

	let restored = 0;
	const walk = (fromDir, toDir) =>
	{
		if (fs.existsSync(fromDir) === false)
		{
			return;
		}

		fs.mkdirSync(toDir, { recursive: true });

		for (const entry of fs.readdirSync(fromDir, { withFileTypes: true }))
		{
			const from = path.join(fromDir, entry.name);
			const to = path.join(toDir, entry.name);

			if (entry.isDirectory())
			{
				walk(from, to);
				continue;
			}

			if (fs.existsSync(to))
			{
				continue;
			}

			copyFileKeepMtime(from, to);
			restored += 1;
		}
	};

	walk(snapshotDir, assetsDir);
	return restored;
};

/**
 * Drop hashed files that have not been part of a build for MAX_AGE_MS.
 *
 * @param {string} assetsDir
 * @returns {number}
 */
const pruneOldAssets = (assetsDir) =>
{
	if (fs.existsSync(assetsDir) === false)
	{
		return 0;
	}

	const cutoff = Date.now() - MAX_AGE_MS;
	let pruned = 0;

	const walk = (dir) =>
	{
		for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
		{
			const full = path.join(dir, entry.name);

			if (entry.isDirectory())
			{
				walk(full);
				continue;
			}

			const stat = fs.statSync(full);
			if (stat.mtimeMs < cutoff)
			{
				fs.unlinkSync(full);
				pruned += 1;
			}
		}
	};

	walk(assetsDir);
	return pruned;
};

/**
 * @param {string} outDir - Vite build outDir (e.g. public/main).
 * @returns {import('vite').Plugin}
 */
export const preserveHashedAssets = (outDir) =>
{
	let snapshotDir = null;

	return {
		name: 'preserve-hashed-assets',
		apply: 'build',
		config()
		{
			const assetsDir = path.join(outDir, 'assets');
			if (fs.existsSync(assetsDir) === false)
			{
				return;
			}

			snapshotDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-assets-'));
			copyDirKeepMtime(assetsDir, snapshotDir);
		},
		closeBundle()
		{
			const assetsDir = path.join(outDir, 'assets');
			let restored = 0;

			if (snapshotDir)
			{
				restored = restoreMissing(snapshotDir, assetsDir);
				fs.rmSync(snapshotDir, { recursive: true, force: true });
				snapshotDir = null;
			}

			const pruned = pruneOldAssets(assetsDir);
			console.log(`[preserve-hashed-assets] restored ${restored}, pruned ${pruned}`);
		}
	};
};

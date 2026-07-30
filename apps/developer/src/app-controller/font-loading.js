/**
 * setupFontLoading
 *
 * Adds 'fonts-loaded' class to <html> when Material Symbols fonts are ready,
 * preventing FOUT. Falls back to a 1s timeout on browsers without the Font
 * Loading API or on failure.
 *
 * @returns {void}
 */
export const setupFontLoading = () =>
{
	if ('fonts' in document)
	{
		// Only the Outlined variant is preloaded (see index.html) and used by
		// the app, so we gate the icon reveal on it alone — no need to wait
		// on Rounded/Sharp faces that are never requested.
		Promise.all([
			document.fonts.load('24px "Material Symbols Outlined"')
		]).then(() => {
			document.documentElement.classList.add('fonts-loaded');
		}).catch(() => {
			setTimeout(() => {
				document.documentElement.classList.add('fonts-loaded');
			}, 1000);
		});
	}
	else
	{
		setTimeout(() => {
			document.documentElement.classList.add('fonts-loaded');
		}, 1000);
	}
};

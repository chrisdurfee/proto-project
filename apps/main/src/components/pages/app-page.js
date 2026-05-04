import { Atom } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * AppPage
 *
 * Shared page wrapper for all primary app pages.
 * Applies pt-0 by default so individual pages don't redeclare it.
 * Any extra classes passed via props.class are appended after pt-0.
 *
 * @param {object} [props]
 * @param {array} [children]
 * @returns {BlankPage}
 */
export const AppPage = Atom((props = {}, children = []) =>
{
	const { class: extraClass, ...rest } = props;
	const pageClass = extraClass ? `pt-0 ${extraClass}` : 'pt-0';
	return new BlankPage({ class: pageClass, ...rest }, children);
});

export default AppPage;

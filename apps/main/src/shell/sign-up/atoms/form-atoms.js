import { Div, H2, Header, P } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';

/**
 * This will create the card header.
 *
 * @param {object} props
 * @returns {object}
 */
export const CardHeader = ({ title, description }) => (
	Header({ class: 'text-center py-6 flex flex-auto flex-col gap-y-1' }, [
		H2({ class: "font-semibold tracking-tight text-2xl" }, title),
		P({ class: "text-sm text-muted-foreground" }, description)
	])
);

/**
 * This will create a form wrapper.
 *
 * @param {object} props
 * @param {array} children
 * @returns {object}
 */
export const FormWrapper = Atom((props, children) => (
	Div({ class: 'w-full mx-auto max-w-sm p-6 fadeIn' }, children)
));
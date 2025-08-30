import { Div, H1, Header } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";

/**
 * This will create a page header for a table page.
 *
 * @returns {object}
 */
export const PageHeader = Atom((props, children) => (
    Header({ class: 'flex flex-col' }, [
        Div({ class: 'flex flex-auto items-center justify-between w-full' }, [
            props.title && H1({ class: 'text-3xl font-bold' }, props.title),
            Div({ class: 'flex items-center gap-2' }, children)
        ])
    ])
));
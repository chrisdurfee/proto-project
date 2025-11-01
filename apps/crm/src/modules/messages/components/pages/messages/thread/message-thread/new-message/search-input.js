import { Div } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Icon, Input } from "@base-framework/ui/atoms";

/**
 * This will create a search input.
 *
 * @param {object} props - The properties of the component.
 * @returns {object} - The search input component.
 */
export const SearchInput = Atom((props) => (
	Div({ class: 'relative flex items-center' }, [
		Input({
			cache: 'input',
			...props,
			class: props.class ?? '',
			placeholder: props.placeholder ?? 'Search...',
			bind: (props.bind ?? [props.state, 'searchQuery'])
		}),
		props.icon && Div({ class: 'absolute flex right-0 mr-2' }, [
			Icon(props.icon)
		])
	])
));

export default SearchInput;
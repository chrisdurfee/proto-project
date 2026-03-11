import { OnState } from "@base-framework/atoms";
import { Jot } from "@base-framework/base";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { ErrorModel } from "../models/error-model.js";

/**
 * This will update the resolve status of the error.
 *
 * @param {string|number} id
 * @param {number} resolved
 * @returns {void}
 */
const updateResolveStatus = (id, resolved) =>
{
	const data = new ErrorModel({
		id,
		resolved
	});

	data.xhr.updateResolved('', (response) =>
	{
	});
};

/**
 * This will create a button to resolve the error.
 *
 * @param {object} props
 * @returns {object}
 */
const ResolveButton = ({ id, row }) => (
	Button({
		variant: 'withIcon',
		class: 'outline',
		icon: Icons.circleCheck,
		click(e, { state })
		{
			e.preventDefault();
			e.stopPropagation();

			updateResolveStatus(id, 1);
			state.resolved = 1;
			row.resolved = 1;
		}
	}, 'Resolve')
);

/**
 * This will create a button to mark as unresolved.
 *
 * @param {object} props
 * @returns {object}
 */
const UnresolveButton = ({ id, row }) => (
	Button({
		variant: 'withIcon',
		class: 'outline',
		icon: Icons.circleX,
		click(e, { state })
		{
			e.preventDefault();
			e.stopPropagation();

			updateResolveStatus(id, 0);
			state.resolved = 0;
			row.resolved = 0;
		}
	}, 'Unresolve')
);

/**
 * This will render the button.
 *
 * @returns {object}
 */
export const ResultButtons = Jot(
{
	/**
	 * @type {object}
	 */
	// @ts-ignore
	state()
	{
		return {
			// @ts-ignore
			resolved: this.resolved
		};
	},

	/**
	 * This will render the button.
	 *
	 * @returns {object}
	 */
	// @ts-ignore
	render()
	{
		const props = {
			// @ts-ignore
			id: this.id,
			// @ts-ignore
			row: this.row
		};

		return OnState('resolved', (resolved) => (resolved === 1 ? UnresolveButton(props) : ResolveButton(props)));
	}
});
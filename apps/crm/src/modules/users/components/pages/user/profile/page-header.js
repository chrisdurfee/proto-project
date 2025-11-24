import { Div, H1 } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu } from "@base-framework/ui/molecules";
import { IsEditor } from "@components/atoms/gate-atoms.js";
import { UserModal } from "../../users/modals/user-modal.js";

/**
 * This will create a user modal.
 *
 * @param {object} context
 * @returns {object}
 */
const openEditModal = (context) => (
	UserModal({
		item: context.data.user,
		onSubmit: (data) =>
		{
			context.data.user = data.get();
		}
	})
);

/**
 * Creates the page header for the profile page.
 *
 * @param {object} props
 * @param {object} props.user - The user data.
 * @param {object} props.context - The context object.
 * @returns {object}
 */
export const PageHeader = ({ context }) => (
	Div({ class: 'flex flex-row justify-between gap-4' }, [
		Div({ class: 'flex flex-col' }, [
			H1({ class: 'text-2xl md:text-2xl font-bold tracking-tight' }, 'Profile'),
		]),
		Div({ class: 'flex flex-row gap-x-2' }, [
			IsEditor(() =>
				new DropdownMenu({
					icon: Icons.ellipsis.vertical,
					variant: 'outline',
					groups: [
						[
							{ icon: Icons.pencil.square, label: 'Edit', value: 'edit' }
						]
					],
					onSelect: (selected) =>
					{
						if (selected.value === 'edit')
						{
							openEditModal(context);
						}
					}
				})
			)
		])
	])
);

export default PageHeader;
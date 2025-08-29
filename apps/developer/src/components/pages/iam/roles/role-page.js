import { Div } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui/pages";
import { RoleModel } from "./models/role-model.js";
import { PageHeader } from "./page-header.js";
import { RoleTable } from "./table/role-table.js";

/**
 * This will create the role page.
 *
 * @returns {object}
 */
export const RolePage = () =>
{
	const data = new RoleModel({
		filter: {

		}
	});

	/**
	 * @type {object}
	 */
	const Props =
	{
		data,

		/**
		 * This will remove the padding.
		 */
		class: 'pt-0',
	};
	return new BlankPage(Props, [
		Div({ class: 'grid grid-cols-1 flex-auto' }, [
			Div({ class: 'flex flex-auto flex-col p-6 pt-0 gap-y-6 md:gap-y-12 md:pt-6 lg:p-8 w-full mx-auto' }, [
				PageHeader(),
				Div({ class: 'flex flex-auto flex-col gap-y-2 md:gap-y-4' }, [
					Div({ class: 'flex flex-auto flex-col overflow-x-auto' }, [
						RoleTable(data)
					])
				])
			])
		])
	]);
};

export default RolePage;
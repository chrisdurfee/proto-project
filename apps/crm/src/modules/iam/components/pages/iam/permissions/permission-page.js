import { Div } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui/pages";
import { PermissionModel } from "./models/permission-model.js";
import { PageHeader } from "./page-header.js";
import { PermissionTable } from "./table/permission-table.js";

/**
 * This will create the permission page.
 *
 * @returns {object}
 */
export const PermissionPage = () =>
{
	const data = new PermissionModel({
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
						PermissionTable(data)
					])
				])
			])
		])
	]);
};

export default PermissionPage;
import { Div } from "@base-framework/atoms";
import { Model } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";
import { UserModel } from "./models/user-model.js";
import { PageHeader } from "./page-header.js";
import { UserTable } from "./table/user-table.js";

/**
 * This will create the user page.
 *
 * @returns {BlankPage}
 */
export const UsersPage = () =>
{
	/**
	 * @type {Model} data
	 */
	const data = new UserModel({
		search: '',
		filter: {}
	});

	/**
	 * @type {object} Props
	 */
	const Props =
	{
		data,
	};

	return new BlankPage(Props, [
		Div({ class: 'grid grid-cols-1 flex-auto' }, [
			Div({ class: 'flex flex-auto flex-col p-6 pt-0 gap-y md:gap-y-12 md:pt-6 lg:p-8 w-full mx-auto' }, [
				PageHeader(),
				Div({ class: 'flex flex-auto flex-col gap-y-2 md:gap-y-4' }, [
					Div({ class: 'flex flex-auto flex-col overflow-x-auto' }, [
						UserTable(data)
					])
				])
			])
		])
	]);
};

export default UsersPage;
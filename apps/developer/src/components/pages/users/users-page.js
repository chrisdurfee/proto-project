import { Model } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";
import FullTablePage, { TableContainer } from "@pages/types/full/table/full-table-page.js";
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

	return FullTablePage({ data }, [
		PageHeader(),
		TableContainer([
			UserTable(data)
		])
	]);
};

export default UsersPage;
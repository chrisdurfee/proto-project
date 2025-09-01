import { Div } from "@base-framework/atoms";
import FullTablePage, { TableContainer } from "@pages/types/full/table/full-table-page.js";
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
		filter: {}
	});

	/**
	 * @type {object}
	 */
	const Props =
	{
		data
	};

	return FullTablePage(Props, [
		PageHeader(),
		TableContainer([
			Div({ class: 'flex flex-auto flex-col overflow-x-auto' }, [
				PermissionTable(data)
			])
		])
	]);
};

export default PermissionPage;
import FullTablePage, { TableContainer } from "@pages/types/full/table/full-table-page.js";
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
		filter: {}
	});

	return FullTablePage({ data, class: 'pt-0' }, [
		PageHeader(),
		TableContainer([
			RoleTable(data)
		])
	]);
};

export default RolePage;
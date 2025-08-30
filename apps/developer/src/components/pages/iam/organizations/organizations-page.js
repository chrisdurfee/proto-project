import FullTablePage, { TableContainer } from "../../types/full/table/full-table-page.js";
import { OrganizationModel } from "./models/organization-model.js";
import { PageHeader } from "./page-header.js";
import { OrganizationTable } from "./table/organization-table.js";

/**
 * This will create the organizations page.
 *
 * @returns {object}
 */
export const OrganizationsPage = () =>
{
	const data = new OrganizationModel({
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
			OrganizationTable(data)
		])
	]);
};

export default OrganizationsPage;
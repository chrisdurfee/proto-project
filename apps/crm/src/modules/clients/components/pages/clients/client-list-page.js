import { Model } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";
import FullTablePage, { TableContainer } from "@pages/types/full/table/full-table-page.js";
import { ClientModel } from "../../models/client-model.js";
import { ClientTable } from "./client-table.js";
import { PageHeader } from "./page-header.js";

/**
 * This will create the client list page.
 *
 * @returns {BlankPage}
 */
export const ClientListPage = () =>
{
	/**
	 * @type {Model} data
	 */
	const data = new ClientModel({
		search: '',
		filter: {}
	});

	return FullTablePage({ data }, [
		PageHeader(),
		TableContainer([
			ClientTable(data)
		])
	]);
};

export default ClientListPage;
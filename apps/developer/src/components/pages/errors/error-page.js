import FullTablePage, { TableContainer } from "@pages/types/full/table/full-table-page.js";
import { ErrorModel } from "./models/error-model.js";
import { PageHeader } from "./page-header.js";
import { ErrorTable } from "./table/error-table.js";

/**
 * This will create the error page.
 *
 * @returns {object}
 */
export const ErrorPage = () =>
{
	const data = new ErrorModel({
		filter: 'all',
		orderBy: {
			createdAt: 'DESC'
		}
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
			ErrorTable(data)
		])
	]);
};

export default ErrorPage;
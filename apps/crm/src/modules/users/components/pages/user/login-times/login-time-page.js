import { UseParent } from "@base-framework/atoms";
import FullTablePage, { TableContainer } from "@components/pages/types/full/table/full-table-page.js";
import { getDate } from "./get-date.js";
import { LoginLogModel } from "./login-log-model.js";
import { LoginTable } from "./login-table.js";
import { PageHeader } from "./page-header.js";

/**
 * This will create the login time page.
 *
 * @returns {object}
 */
export const LoginTimePage = () =>
{
	const data = new LoginLogModel({
		filter: {

		},
		dates: {
			start: getDate('start'),
			end: getDate('end')
		},
		orderBy: {
			createdAt: 'DESC'
		}
	});

	/**
	 * @type {object} Props
	 */
	const Props =
	{
		data,
	};

	return FullTablePage(Props, [
		PageHeader(),
		TableContainer([
			UseParent(({ route }) =>
			{
				// @ts-ignore
				data.userId = route.userId;
				return LoginTable(data);
			})
		])
	]);
};

export default LoginTimePage;
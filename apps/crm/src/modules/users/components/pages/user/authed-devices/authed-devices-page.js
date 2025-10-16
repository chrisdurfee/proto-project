import { UseParent } from "@base-framework/atoms";
import FullTablePage, { TableContainer } from "@components/pages/types/full/table/full-table-page.js";
import { UserAuthedDeviceModel } from "../../users/models/user-authed-device-model.js";
import { AuthedDevicesTable } from "./authed-devices-table.js";
import { PageHeader } from "./page-header.js";

/**
 * This will create the authorized devices page.
 *
 * @returns {object}
 */
export const AuthedDevicesPage = () =>
{
	const data = new UserAuthedDeviceModel({
		userId: null,
		filter: {

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
				return AuthedDevicesTable(data);
			})
		])
	]);
};

export default AuthedDevicesPage;
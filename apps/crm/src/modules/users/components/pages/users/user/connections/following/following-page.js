import { UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui";
import { TableContainer } from "@components/pages/types/full/table/full-table-page.js";
import { FollowingModel } from "./following-model.js";
import { FollowingTable } from "./following-table.js";

/**
 * This will create the following page.
 *
 * @returns {object}
 */
export const FollowingPage = () =>
{
	const data = new FollowingModel({
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

	return new BlankPage(Props, [
		TableContainer([
			UseParent(({ route }) =>
			{
				// @ts-ignore
				data.userId = route.userId;
				return FollowingTable(data);
			})
		])
	]);
};

export default FollowingPage;
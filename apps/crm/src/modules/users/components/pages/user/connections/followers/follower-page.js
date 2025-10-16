import { UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui";
import { TableContainer } from "@components/pages/types/full/table/full-table-page.js";
import { FollowerModel } from "./follower-model.js";
import { FollowerTable } from "./follower-table.js";

/**
 * This will create the login time page.
 *
 * @returns {object}
 */
export const FollowerPage = () =>
{
	const data = new FollowerModel({
		userId: null,
		filter: {

		},
		orderBy: {
			createdAt: 'DESC'
		}
	});

	return new BlankPage({ data }, [
		TableContainer([
			UseParent(({ route }) =>
			{
				// @ts-ignore
				data.userId = route.userId;
				return FollowerTable(data);
			})
		])
	]);
};

export default FollowerPage;
import { UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui";
import { TableContainer } from "@components/pages/types/full/table/full-table-page.js";
import { BlockedModel } from "./blocked-model.js";
import { BlockedTable } from "./blocked-table.js";

/**
 * This will create the blocked page.
 *
 * @returns {object}
 */
export const BlockedPage = () =>
{
	const data = new BlockedModel({
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
				return BlockedTable(data);
			})
		])
	]);
};

export default BlockedPage;
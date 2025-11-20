import DataPage, { ContentContainer } from "@pages/types/data/data-page.js";
import { ClientCallModel } from "../../../../models/client-call-model.js";
import { CallList } from "./call-list.js";
import { PageHeader } from "./page-header.js";

/**
 * CallPage
 *
 * Page showing a client's call list.
 *
 * @returns {object} A DataPage component.
 */
export const CallPage = () =>
{
	const data = new ClientCallModel(
	{
		clientId: null,
		loaded: false,
		calls: []
	});

	return DataPage({ data }, ({ route }) =>
	{
		// @ts-ignore
		data.clientId = route.clientId;
		return ContentContainer([
			PageHeader(),
			CallList({ data })
		]);
	});
};

export default CallPage;

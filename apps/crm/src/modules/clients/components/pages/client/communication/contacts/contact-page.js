import DataPage, { ContentContainer } from "@pages/types/data/data-page.js";
import { ClientContactModel } from "../../../../models/client-contact-model.js";
import { ContactList } from "./contact-list.js";
import { PageHeader } from "./page-header.js";

/**
 * ContactPage
 *
 * Page showing a client's contact list.
 *
 * @returns {object} A DataPage component.
 */
export const ContactPage = () =>
{
	const data = new ClientContactModel(
	{
		clientId: null,
		loaded: false,
		contacts: []
	});

	return DataPage({ data }, ({ route }) =>
	{
		// @ts-ignore
		data.clientId = route.clientId;
		return ContentContainer([
			PageHeader(),
			ContactList({ data })
		]);
	});
};

export default ContactPage;
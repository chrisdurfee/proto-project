import { Div, UseParent } from "@base-framework/atoms";
import { Page } from "@base-framework/ui/pages";
import { ClientContactModel } from "../../../clients/models/client-contact-model.js";
import { ContactList } from "./contact-list.js";
import { PageHeader } from "./page-header.js";

/**
 * ContactPage
 *
 * Page showing a client's contact list.
 *
 * @returns {object} A Page component.
 */
export const ContactPage = () =>
{
	const data = new ClientContactModel(
	{
		clientId: null,
		loaded: false,
		contacts: []
	});

	/**
	 * @type {object} props
	 */
	const props =
	{
		data,
	};

	return new Page(props, [
		UseParent(({ route }) =>
		{
			// @ts-ignore
			data.clientId = route.clientId;
			return Div({ class: "p-6 2xl:mx-auto w-full contained" }, [
				PageHeader(),
				ContactList({ data })
			]);
		})
	]);
};

export default ContactPage;
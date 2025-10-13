import { Div, On } from "@base-framework/atoms";
import { Page } from "@base-framework/ui/pages";
import { ClientContactModel } from "../../../clients/models/client-contact-model.js";
import { ContactList } from "./contact-list.js";
import ContactSkeleton from "./contact-skeleton.js";
import { PageHeader } from "./page-header.js";

/**
 * props for ClientContactsPage
 *
 * @type {object} props
 */
const props =
{
	class: 'flex flex-auto flex-col w-full',

	/**
	 * setData
	 *
	 * Initializes component state.
	 *
	 * @returns {object} ClientContactModel instance with loaded and contacts.
	 */
	setData()
	{
		const clientId = this.route.clientId;
		return new ClientContactModel(
		{
			clientId,
			loaded: false,
			contacts: []
		});
	},

	/**
	 * afterSetup
	 *
	 * Fetches contact data after mount.
	 *
	 * @returns {void}
	 */
	afterSetup()
	{
		const data = this.data;
		data.xhr.get('', (response) =>
		{
			if (!response || response.success === false)
			{
				data.set({ contacts: [], loaded: true });
				return;
			}

			const contacts = response.rows || [];
			data.set({ contacts, loaded: true });
		});
	},

	/**
	 * beforeDestroy
	 *
	 * Cleans up component state.
	 *
	 * @returns {void}
	 */
	beforeDestroy()
	{
		this.data.delete();
		this.data.loaded = false;
	}
};

/**
 * ContactPage
 *
 * Page showing a client's contact list.
 *
 * @returns {object} A Page component.
 */
export const ContactPage = () =>
	new Page(props, [
		On("loaded", (loaded, ele, { data }) =>
		{
			if (!loaded)
			{
				return ContactSkeleton();
			}

			return Div({ class: "p-6 2xl:mx-auto w-full contained" }, [
				PageHeader(),
				ContactList({ contacts: data.contacts })
			]);
		})
	]);

export default ContactPage;
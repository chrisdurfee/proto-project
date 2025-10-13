import { Div, OnRoute } from "@base-framework/atoms";
import { Overlay } from "@base-framework/ui/organisms";
import { FullScreenOverlay } from "@components/organisms/overlays/full/full-screen-overlay.js";
import { ClientModel } from "../clients/models/client-model.js";
import { ContentSection } from "./content-section.js";
import { Sidebar } from "./sidebar.js";

/**
 * Props for the ClientPage component.
 *
 * @typedef {object} Props
 */
const Props =
{
	/**
	 * Sets the context data for the client page.
	 *
	 * @param {object|null} context
	 * @returns {object}
	 */
	setContext(context)
	{
		return {
			data: new ClientModel({
				client: null,
				loaded: false
			})
		};
	},

	/**
	 * Updates the client data by fetching the latest information.
	 */
	updateClient()
	{
		const data = this.context.data;
		data.id = this.route.clientId;
		data.xhr.get('', (response) =>
		{
			if (!response || response.success === false)
			{
				data.set({ client: null, loaded: true });
				return;
			}

			const client = response.row || null;
			data.set({ client, loaded: true });
		});
	},

	/**
	 * Deletes the data when the component is destroyed.
	 *
	 * @returns {void}
	 */
	beforeDestroy()
	{
		const data = this.context.data;
		data.delete();
		data.loaded = false;
	}
};

/**
 * ClientPage
 *
 * Dynamically displays client details based on the `clientId` from the route.
 *
 * @returns {Overlay}
 */
export const ClientPage = () => (
	FullScreenOverlay(Props, (parent) => ([
		OnRoute('clientId', (clientId) =>
		{
			parent.updateClient();

			return Div({ class: 'flex flex-auto flex-col lg:flex-row' }, [
				Sidebar({ clientId: clientId }),
				ContentSection({ clientId: clientId })
			])
		})
	]))
);

export default ClientPage;
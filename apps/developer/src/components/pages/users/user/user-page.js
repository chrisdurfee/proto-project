import { Div, OnRoute } from "@base-framework/atoms";
import { Overlay } from "@base-framework/ui/organisms";
import { FullScreenOverlay } from "@components/organisms/overlays/full/full-screen-overlay.js";
import { UserModel } from "../models/user-model.js";
import { ContentSection } from "./content-section.js";
import { Sidebar } from "./sidebar.js";

/**
 * Props for the UserPage component.
 *
 * @typedef {object} Props
 */
const Props =
{
	/**
	 * Sets the context data for the user page.
	 *
	 * @param {object|null} context
	 * @returns {object}
	 */
	setContext(context)
	{
		return {
			data: new UserModel({
				user: null,
				loaded: false
			})
		};
	},

	/**
	 * Loads the user data after the component is set up.
	 *
	 * @returns {void}
	 */
	afterSetup()
	{
		const data = this.context.data;
		data.id = this.route.userId;
		data.xhr.get('', (response) =>
		{
			if (!response || response.success === false)
			{
				data.set({ user: null, loaded: true });
				return;
			}

			const user = response.row || null;
			data.set({ user, loaded: true });
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
 * UserPage
 *
 * Dynamically displays user details based on the `userId` from the route.
 *
 * @returns {Overlay}
 */
export const UserPage = () => (
	FullScreenOverlay(Props, ({ route }) => ([
		OnRoute('userId', (userId) => (
			Div({ class: 'flex flex-auto flex-col lg:flex-row' }, [
				Sidebar({ userId: userId }),
				ContentSection({ userId: userId })
			])
		))
	]))
);

export default UserPage;
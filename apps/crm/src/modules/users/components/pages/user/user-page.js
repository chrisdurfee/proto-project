import { Div, OnRoute } from "@base-framework/atoms";
import { Overlay } from "@base-framework/ui/organisms";
import { FullScreenOverlay } from "@components/organisms/overlays/full/full-screen-overlay.js";
import { UserModel } from "../users/models/user-model.js";
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
	 * Updates the user data by fetching the latest information.
	 */
	updateUser()
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
			this.updateTitle(user);

			data.set({ user, loaded: true });
		});
	},

	/**
	 * Update the page title based on the user.
	 *
	 * @param {object} user
	 */
	updateTitle(user)
	{
		const displayName = (user?.firstName + ' ' + user?.lastName) || '';
		const title = displayName.substring(0, 30) + ' - User';
		// @ts-ignore
		this.route.setTitle(title);
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
	FullScreenOverlay(Props, (parent) => ([
		OnRoute('userId', (userId) =>
		{
			parent.updateUser();

			return Div({ class: 'flex flex-auto flex-col lg:flex-row' }, [
				Sidebar({ userId: userId }),
				ContentSection({ userId: userId })
			])
		})
	]))
);

export default UserPage;
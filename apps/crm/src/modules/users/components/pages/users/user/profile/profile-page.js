import { Div, On } from "@base-framework/atoms";
import { Page } from "@base-framework/ui/pages";
import { UserSkeleton } from "../user-skeleton.js";
import { PageHeader } from "./page-header.js";
import { UserContent } from "./user-content.js";
import UserHeader from "./user-header.js";

/**
 * ProfilePage
 *
 * Profile page for displaying user information.
 *
 * @returns {object}
 */
export const ProfilePage = () => (
	new Page({ class: 'flex flex-auto flex-col' }, [
		On("loaded", (loaded, ele, { context }) =>
		{
			if (!loaded)
			{
				return UserSkeleton();
			}

			const user = context.data.user;
			return (!user)
			? Div({ class: "text-center" }, "User not found.")
			: Div({ class: 'md:p-6 md:pt-0 2xl:mx-auto w-full 2xl:max-w-[1600px]' }, [
				PageHeader({
					user,
					context
				}),
				Div({ class: 'flex flex-auto flex-col lg:flex-row lg:space-x-8'}, [
					Div({ class: 'w-full lg:w-1/3' }, [
						UserHeader({ user })
					]),
					Div({ class: 'flex-1' }, [
						UserContent({ user }),
					])
				])
			]);
		})
	])
);

export default ProfilePage;
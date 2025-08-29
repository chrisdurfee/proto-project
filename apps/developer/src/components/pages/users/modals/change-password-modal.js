import { Div } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Modal } from "@base-framework/ui/molecules";
import { UserModel } from "../models/user-model.js";
import { PasswordForm } from "./password-form.js";
import { validate } from "./validate.js";

/**
 * Update an existing user.
 *
 * @param {object} data
 * @returns {void}
 */
const update = (data) =>
{
	data.xhr.updateCredentials('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while updating the credentials.",
				icon: Icons.shield
			});
			return;
		}

		if (response.username === 'taken')
		{
			app.notify({
				type: "destructive",
				title: "Username Taken",
				description: "The username is already taken. Please choose a different one.",
				icon: Icons.shield
			});
			return;
		}

		if (response.username === 'failed')
		{
			app.notify({
				type: "destructive",
				title: "Username Failed",
				description: "The username update failed. Please try again.",
				icon: Icons.shield
			});
			return;
		}

		if (response.password === 'failed')
		{
			app.notify({
				type: "destructive",
				title: "Password Failed",
				description: "The password update failed. Please try again.",
				icon: Icons.shield
			});
			return;
		}

		app.notify({
			type: "success",
			title: "Credentials Updated",
			description: "The credentials have been updated.",
			icon: Icons.check
		});
	});
};

/**
 * ChangePasswordModal
 *
 * A modal for changing a user's password.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const ChangePasswordModal = (props = {}) =>
{
	const item = props.item || {};
	const data = new UserModel(item);

	return new Modal({
		data,
		title: 'Change Password',
		icon: Icons.locked,
		description: 'Update your password.',
		size: 'md',
		type: 'right',
		onClose: (parent) => props.onClose && props.onClose(data, parent),
		onSubmit: ({ data }) =>
		{
			/**
			 * Only validate if password is present.
			 */
			if (data.password)
			{
				const password = data.password;
				const confirmPassword = data.confirmPassword;
				if (!validate(password, confirmPassword))
				{
					return false;
				}
			}

			// Check if either username or password it set
			if (!data.username && !data.password)
			{
				app.notify({
					type: "warning",
					title: "Error",
					description: "Please enter a username or new password.",
					icon: Icons.shield
				});
				return false;
			}

            update(data);

			if (props.onSubmit)
			{
				props.onSubmit(data);
			}
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, PasswordForm())
		])
	]).open();
};
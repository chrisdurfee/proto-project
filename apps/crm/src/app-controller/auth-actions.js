import { Configs } from '../configs.js';
import { mergeAndStoreUser } from './user-data.js';

/**
 * signIn
 *
 * Flip the app-shell into its signed-in state, sync the user
 * record into local storage, and bring up push (when configured).
 *
 * @param {object} self - AppController instance.
 * @param {object} user
 * @returns {void}
 */
export const signIn = (self, user) =>
{
	self.appShell.state.isSignedIn = true;
	mergeAndStoreUser(self.data.user, user);
	if (self.push) self.push.setup();
};

/**
 * signOut
 *
 * Hit the logout endpoint, clear the persisted user, and force-reload
 * to the app root so any in-memory state is dropped along with the
 * session cookie.
 *
 * @param {object} self - AppController instance.
 * @returns {void}
 */
export const signOut = (self) =>
{
	self.appShell.state.isSignedIn = false;
	self.data.auth.xhr.logout('', () =>
	{
		self.data.user.delete().store();
		window.location = Configs.router.baseUrl;
	});
};

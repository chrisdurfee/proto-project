import { Configs } from '../configs.js';
import { mergeAndStoreUser } from './user-data.js';

/**
 * signIn
 *
 * Syncs the user record into local storage after a successful login.
 *
 * @param {object} self - AppController instance.
 * @param {object} user
 * @returns {void}
 */
export const signIn = (self, user) =>
{
	mergeAndStoreUser(self.data.user, user);
};

/**
 * signOut
 *
 * Hits the logout endpoint, clears the persisted user, and force-reloads
 * to the app root so any in-memory state is dropped along with the
 * session cookie.
 *
 * @param {object} self - AppController instance.
 * @returns {void}
 */
export const signOut = (self) =>
{
	self.data.auth.xhr.logout('', () =>
	{
		self.data.user.delete().store();
		window.location = Configs.router.baseUrl;
	});
};

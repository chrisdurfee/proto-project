import { UserData } from '../shell/models/user-data.js';

/**
 * createUserData
 *
 * Constructs a UserData instance and restores it from local storage.
 *
 * @returns {object}
 */
export const createUserData = () =>
{
	const user = new UserData();
	user.setKey('user');
	user.resume();
	return user;
};

/**
 * mergeAndStoreUser
 *
 * Merges a partial user payload into the existing UserData and persists.
 *
 * @param {object} userData
 * @param {object|null} data
 * @returns {void}
 */
export const mergeAndStoreUser = (userData, data) =>
{
	if (!data)
	{
		return;
	}

	const current = userData.get() || {};
	userData
		.set({ ...current, ...data })
		.store();
};

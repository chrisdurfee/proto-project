import { Model } from "@base-framework/base";

/**
 * UserSearchModel
 *
 * A safe, read-only model for searching users. Points to the
 * /api/user/search endpoint which returns only public profile
 * fields (id, username, name, image, status, verified, etc.).
 *
 * Use this model instead of UserData for any user search/lookup
 * that does not require full user data.
 *
 * @type {typeof Model}
 */
export const UserSearchModel = Model.extend({
	url: '/api/user/search'
});

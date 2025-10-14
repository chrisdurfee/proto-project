import { Model } from "@base-framework/base";

/**
 * FollowingModel
 *
 * This model is used to handle the following model.
 *
 * @type {typeof Model}
 */
export const FollowingModel = Model.extend({
	url: '/api/user/[[userId]]/following',
});
import { Model } from "@base-framework/base";

/**
 * BlockedModel
 *
 * This model is used to handle the blocked users model.
 *
 * @type {typeof Model}
 */
export const BlockedModel = Model.extend({
	url: '/api/user/[[userId]]/blocked',
});
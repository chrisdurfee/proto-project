import { Model } from "@base-framework/base";

/**
 * ClientCallModel
 *
 * This model is used to handle client calls.
 *
 * @type {typeof Model}
 */
export const ClientCallModel = Model.extend({
	url: '/api/client/[[clientId]]/call'
});

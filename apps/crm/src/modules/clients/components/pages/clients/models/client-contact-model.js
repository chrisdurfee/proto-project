import { Model } from "@base-framework/base";

/**
 * ClientContactModel
 *
 * This model is used to handle client contacts.
 *
 * @type {typeof Model}
 */
export const ClientContactModel = Model.extend({
	url: '/api/client/[[clientId]]/contact'
});

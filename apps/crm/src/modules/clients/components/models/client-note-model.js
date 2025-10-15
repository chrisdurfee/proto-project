import { Model } from "@base-framework/base";

/**
 * ClientNoteModel
 *
 * This model is used to handle client notes.
 *
 * @type {typeof Model}
 */
export const ClientNoteModel = Model.extend({
	url: '/api/client/[[clientId]]/note'
});

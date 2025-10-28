import { Model } from "@base-framework/base";

/**
 * ConversationModel
 *
 * This model handles conversation data and API operations.
 * Uses default CRUD operations (add, update, delete, get, all).
 *
 * @type {typeof Model}
 */
export const ConversationModel = Model.extend({
	url: '/api/messaging/conversations',

	defaults: {
		id: null,
		type: 'direct',
		title: null,
		description: null,
		participantId: null,
		lastMessageAt: null,
		lastMessageId: null,
		createdBy: null,
		createdAt: null,
		updatedAt: null
	}
});
import { Model } from '@base-framework/base';

/**
 * SupportMessageModel
 *
 * Talks to the Support API backing the Help Center forms.
 *
 * The built-in add() / all() / get() methods cover everything these
 * forms need, so no custom xhr methods are declared here.
 *
 * @type {typeof Model}
 */
export const SupportMessageModel = Model.extend({
	url: '/api/support/message'
});

export default SupportMessageModel;

import { Section } from '@base-framework/atoms';
import { LeftPane } from '../atoms/left-pane.js';
import { RightPane } from '../atoms/right-pane.js';
import { STEPS } from '../steps.js';

/**
 * @function WelcomeSection
 * @description
 *  Creates the split layout of the welcome page:
 *    - Left side: branding/testimonial panel
 *    - Right side: sign-up intro card
 *
 * @returns {object} A Section component containing the two panes.
 */
export const WelcomeSection = () =>
(
	Section({
		class: 'flex flex-auto flex-col md:flex-row',

		/**
		 * We will check to resume the sign-up process if the
		 * user is already in the session.
		 * @param {object} ele
		 * @param {object} parent
		 */
		onCreated(ele, parent)
		{
			parent.state.loading = true;

			const data = parent.context.data;
			data.xhr.getSessionUser('', (response) =>
			{
				parent.state.loading = false;
				if (response && response.user)
				{
					data.set(response.user);

					parent.showStep(STEPS.USER_DETAILS);
				}
			});
		}
	}, [
		LeftPane(),
		RightPane()
	])
);
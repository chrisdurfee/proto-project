import { Div } from '@base-framework/atoms';
import { FullscreenPage } from '@base-framework/ui/pages';
import { PageStepContainer } from './page-step-container.js';
import { STEPS } from './steps.js';

/**
 * @function getSearchStep
 * @description
 *  Retrieves the current "step" from the URL search parameters.
 *
 * @returns {string|null} The value of the "step" parameter or null if not present.
 */
const getSearchStep = () =>
{
	const params = new URLSearchParams(window.location.search);
	return params.get('step');
};

/**
 * @typedef {object} PageSettings
 * @property {Function} setupStates - Defines initial state.
 * @property {Function} showStep    - Updates the "step" state.
 */

/**
 * @type {PageSettings}
 * @description
 *  Settings for configuring the sign-up page. Maintains
 *  the `step` in the component’s state and provides a
 *  method to show different steps.
 */
const PageProps =
{
	/**
	 * @function setupStates
	 * @description
	 *  Defines the initial state values for the sign-up page.
	 *
	 * @returns {object} The initial state (with step = WELCOME).
	 */
	setupStates()
	{
		const step = getSearchStep() || STEPS.WELCOME;

		return {
			step,
			loading: false,
			googleLoading: false
		};
	},

	/**
	 * @function showStep
	 * @description
	 *  Updates the `step` state to a new step key.
	 *
	 * @param {string} step - One of the STEPS constants.
	 */
	showStep(step)
	{
		// @ts-ignore
		this.state.step = step;
	}
};

/**
 * @function SignUpPage
 * @description
 *  Constructs a FullscreenPage using our page settings and
 *  the PageStepContainer, which renders all step UI.
 *
 * @returns {FullscreenPage} A FullscreenPage instance.
 */
export const SignUpPage = () =>
(
	new FullscreenPage(PageProps, [
		Div({
			class: 'flex flex-auto flex-col',
			switch: [
				{
					uri: '/login/google/signup/callback*',
					import: () => import('./google-callback.js')
				},
				{
					component: PageStepContainer()
				}
			]
		})
	])
);

export default SignUpPage;
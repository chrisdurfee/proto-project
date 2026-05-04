import { Main } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { SafeZoneTop } from '@base-framework/ui/atoms';
import { modules } from '../modules/modules.js';
import { Heartbeat } from './heartbeat/heartbeat.js';
import { AppControl } from './navigation/app-control.js';

/**
 * This will create the active panel container.
 *
 * @param {object} props
 * @param {array} children
 * @returns {object}
 */
const ActivePanelContainer = Atom((props, children) =>
{
	return Main({
		class: 'active-panel-container flex flex-auto relative z-0 md:pb-0 will-change-contents backface-hidden',
		...props,
		children
	});
});

/**
 * This will create the main content of the app shell.
 *
 * @returns {Array<object>}
 */
export const MainContent = () =>
{
	const { routes, links: options } = modules;

	return [
		Heartbeat(),
		SafeZoneTop(),

		/**
		 * This will add the desktop and mobile navigation.
		 */
		new AppControl({ options }),

		/**
		 * This will add the active panel container that will hold the main body.
		 */
		ActivePanelContainer({
			switch: routes,
			cache: 'mainBody'
		})
	];
};

export default MainContent;
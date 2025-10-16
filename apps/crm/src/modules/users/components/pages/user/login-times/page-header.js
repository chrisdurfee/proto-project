import { Div } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DateRangePicker } from "@base-framework/ui/molecules";
import { PageHeader as TablePageHeader } from "@components/pages/types/page-header.js";
import { getDate } from "./get-date.js";

/**
 * This will refresh the list.
 *
 * @param {object} e - The event object.
 * @param {object} parent - The parent object.
 * @returns {void}
 */
const refresh = (e, { list }) =>
{
	list.refresh();
};

/**
 * This will create a page header for the timeclock page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	TablePageHeader({ title: 'Login Times' }, [
		new DateRangePicker({
			start: getDate('start'),
			end: getDate('end'),
			onChange: (range, { data, list }) =>
			{
				data.dates = {
					start: range.start,
					end: range.end
				};

				list.refresh();
			}
		}),
		Div({ class: 'hidden lg:flex' }, [
			Button({ variant: 'withIcon', class: 'text-muted-foreground primary', icon: Icons.refresh, click: refresh }, 'Refresh')
		]),
		Div({ class: 'flex lg:hidden mr-0' }, [
			Tooltip({ content: 'Refresh', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.refresh, click: refresh }))
		]),
	])
);
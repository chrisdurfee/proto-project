import { Div } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { PageHeader as TablePageHeader } from "@components/pages/types/page-header.js";

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
 * This will create a page header for the authorized devices page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
    TablePageHeader({ title: 'Authorized Devices' }, [
        Div({ class: 'hidden lg:flex' }, [
            Button({ variant: 'withIcon', class: 'outline', icon: Icons.refresh, click: refresh }, 'Refresh')
        ]),
        Div({ class: 'flex lg:hidden mr-0' }, [
            Tooltip({ content: 'Refresh', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.refresh, click: refresh }))
        ]),
    ])
);
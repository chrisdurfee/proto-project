import { Div, On } from "@base-framework/atoms";
import { EmptyState } from "@base-framework/ui/molecules";
import { Page } from "@base-framework/ui/pages";
import { ClientContent } from "./client-content.js";
import ClientSkeleton from "./client-skeleton.js";
import { ConversationSection } from "./conversation/conversation-section.js";
import { PageHeader } from "./page-header.js";

/**
 * SummaryPage properties.
 *
 * @type {object} props
 */
const props =
{
	class: 'flex flex-auto flex-col w-full'
};

/**
 * SummaryPage
 *
 * Summary page for displaying client information.
 *
 * @returns {Page}
 */
export const SummaryPage = () => (
	new Page(props, [
		On("loaded", (loaded, ele, { context }) =>
		{
			if (!loaded)
			{
				return ClientSkeleton();
			}

			const client = context.data.client;
			if (!client)
			{
				return EmptyState({
					title: 'Client not found',
					description: 'Please check the client ID and try again.'
				});
			}

			return Div({ class: 'flex flex-auto p-0 pt-0 w-full' }, [
				Div({ class: 'flex flex-auto flex-col lg:flex-row'}, [
					Div({ class: 'flex flex-auto flex-col min-w-0' }, [
						Div({ class: 'flex flex-col w-full max-w-[1400px] md:p-6 mx-auto' }, [
							PageHeader(client),
							ClientContent({ client }),
						])
					]),
					Div({ class: 'hidden 2xl:flex flex-none min-w-[420px] border-l' }, [
						ConversationSection({ client })
					]),
				])
			]);
		})
	])
);

export default SummaryPage;
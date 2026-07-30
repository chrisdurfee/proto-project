import { Div } from "@base-framework/atoms";
import { ClientSummaryCard } from "./client-summary-card.js";

/**
 * ClientSummaryCards
 *
 * A section displaying client summary cards.
 *
 * @returns {object}
 */
export const ClientSummaryCards = () => (
	Div({ class: 'hidden md:flex flex-auto overflow-x-auto -mx-6 px-6 pb-2' }, [
		Div({ class: 'inline-flex flex-auto gap-x-4 ml-[-24px] pl-6' }, [
			ClientSummaryCard({
				title: 'Total Clients',
				value: '1,200',
				change: '+5.4% from last month',
				icon: 'group'
			}),
			ClientSummaryCard({
				title: 'New Clients',
				value: '350',
				change: '+12% from last month',
				icon: 'person_add'
			}),
			ClientSummaryCard({
				title: 'Lost Clients',
				value: '25',
				change: '-3% from last month',
				icon: 'person_remove'
			}),
			ClientSummaryCard({
				title: 'Total Revenue',
				value: '$145,678.00',
				change: '+10% from last month',
				icon: 'payments'
			}),
		])
	])
);

export default ClientSummaryCards;
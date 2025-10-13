import { A, Div, H2, Header, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { List } from "@base-framework/organisms";
import { Card, Icon } from "@base-framework/ui";
import { Badge } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";
import { ClientSummaryCard } from "./client-summary-card.js";

/**
 * ProfileSection
 *
 * Generic section wrapper.
 *
 * @param {object} props - Properties for the section.
 * @returns {object}
 */
const ProfileSection = Atom((props, children) =>
	Div({ class: "flex flex-col gap-y-6" }, [
		Header({ class: "flex flex-col gap-y-2" }, [
			H2({ class: "text-xl font-semibold" }, props.title),
			props.description && P({ class: "text-sm text-muted-foreground" }, props.description)
		]),
		...children
	])
);

/**
 * ClientAvatarSection
 *
 * Shows the client logo/avatar, long name + code, contact name, and status
 * laid out exactly as in the design.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const ClientAvatarSection = Atom(({ client }) =>
	Div({ class: "flex items-center gap-x-4 my-0" }, [
		Avatar({
			src: client.avatar,
			alt: "[[client.companyName]]",
			watcherFallback: "[[client.companyName]]",
			size: "lg"
		}),
		Div({ class: "flex flex-col gap-y-1" }, [
			Div({ class: "flex items-baseline gap-x-2" }, [
				H2({ class: "text-2xl font-semibold text-foreground" }, Format.default("[[client.companyName]]", "Unnamed Client")),
				P({ class: "text-sm text-muted-foreground" }, "#[[client.id]]")
			]),
			Div({ class: "flex items-center gap-x-2" }, [
				P({ class: "text-sm text-muted-foreground" }, Format.default("[[client.contactName]]", "No contact")),
				Badge({
					variant: client.status === "Active" ? "primary" : "secondary"
				}, Format.default("[[client.status]]", "Unknown"))
			])
		])
	])
);

/**
 * ClientSummaryCardsSection
 *
 * Horizontal scrollable cards at the top of the client page.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const ClientSummaryCardsSection = Atom(({ client }) =>
	Div({ class: "relative -mx-6 pl-6" }, [
		Div({
			class:
				"pointer-events-none absolute top-0 left-0 h-full w-6 " +
				"bg-linear-to-r from-background to-transparent"
		}),
		Div({ class: "flex flex-auto overflow-x-auto -ml-6 mr-0 px-6" }, [
			Div({ class: "flex gap-x-4 pb-4 max-w-xs" }, [
				ClientSummaryCard({
					title: "Payment Amount",
					value: Format.money("[[client.paymentAmount]]", "$", "0.00"),
					icon: Icons.creditCard,
					url: `clients/client/${client.id}/billing/payments`
				}),
				ClientSummaryCard({
					title: "Package",
					value: Format.default("[[client.package]]", "Basic"),
					icon: Icons.cube,
					url: `clients/client/${client.id}/billing/orders`
				}),
				ClientSummaryCard({
					title: "Next Due Date",
					value: Format.date("[[client.nextDue]]", "N/A"),
					icon: Icons.calendar.default,
					url: `clients/client/${client.id}/billing/payments`
				}),
				ClientSummaryCard({
					title: "Secret Passphrase",
					value: Format.default("[[client.passphrase]]", "N/A"),
					icon: Icons.locked
				}),
				ClientSummaryCard({
					title: "Client Since",
					value: Format.date("[[client.createdAt]]"),
					icon: Icons.clock
				})
			])
		]),
		Div({
			class:
				"pointer-events-none absolute top-0 right-0 h-full w-16 " +
				"bg-linear-to-l from-background to-transparent"
		})
	])
);

/**
 * AboutSection
 *
 * Simple header + paragraph, no card.
 *
 * @param {object} props
 * @param {string} props.about - User about text.
 * @returns {object}
 */
export const AboutSection = ({ about }) =>
	ProfileSection({ title: "About"}, [
		P({ class: "text-base text-muted-foreground max-w-[800px]" }, Format.default("[[client.notes]]", "No information available."))
	]);


/**
 * ContractSection
 *
 * Displays contract expiration and add-ons.
 *
 * @param {object} props - Properties for the section.
 * @returns {object}
 */
export const ContractSection = Atom(({client}) =>
	ProfileSection({ title: "Packages and Contract" }, [
		Card({ class: "p-6", margin: "m-0", hover: true }, [
			Div({ class: "grid grid-cols-1 sm:grid-cols-2 gap-6" }, [
				// left side
				Div({ class: "flex flex-col gap-y-12" }, [
					// expiration row
					Div({ class: "flex flex-col gap-y-1" }, [
						P({ class: "text-sm text-muted-foreground" }, "Contract expiration in 8 months"),
						Div({ class: "flex items-center gap-x-2" }, [
							P({ class: "font-medium text-foreground" }, Format.date("[[client.contractExpires]]", "No contract")),
							Badge({ variant: "secondary" }, Format.default("[[client.contractStatus]]", "N/A"))
						])
					]),
					// billing row
					Div({ class: "flex flex-col gap-y-1" }, [
						P({ class: "text-sm text-muted-foreground" }, "Billing"),
						P({ class: "font-medium text-foreground", watch: ['[[client.package]][[client.contractId]][[client.payment]]', ([pkg, id, payment]) => {
							if (!pkg && !id && !payment) return "No billing information";
							const packageName = pkg || "No package";
							const contractId = id || "N/A";
							const paymentAmount = payment ? `$${parseFloat(payment).toFixed(2)}` : "$0.00";
							return `${packageName} (ID: ${contractId}), ${paymentAmount} monthly`;
						}] })
					])
				]),
				// right side
				Div({ class: "flex flex-col gap-y-12" }, [
					Div({ class: "flex flex-col gap-y-1" }, [
						P({ class: "text-sm text-muted-foreground" }, "Upgrades"),
						Div({ class: "flex flex-wrap gap-2", onSet: ['client.addOns', (addOns) => {
							if (!addOns || !addOns.length) return P({ class: "text-sm text-muted-foreground" }, "No upgrades");
							return addOns.map(a => Badge({ variant: "outline" }, a));
						}] })
					]),
					Div({ class: "flex flex-col gap-y-1" }, [
						P({ class: "text-sm text-muted-foreground" }, "Sales Agent"),
						P({ class: "font-medium text-foreground" }, Format.default("[[client.salesAgent]]", "Not Assigned"))
					])
				])
			])
		])
	])
);

/**
 * TicketIcon
 *
 * @param {string} priority - The priority of the ticket.
 * @returns {string} - The icon svg
 */
const TicketIcon = (priority) =>
{
	switch (priority)
	{
		case "high":
			return Icons.chevron.up;
		case "low":
			return Icons.chevron.down;
		default:
			return Icons.check;
	}
};

/**
 * TicketListItem
 *
 * Renders a single ticket as a row in the list.
 *
 * @param {object} ticket
 * @returns {object}
 */
const TicketListItem = Atom(ticket =>
	Card({ class: "flex items-center justify-between p-4 cursor-pointer", margin: "my-2", hover: true }, [
		Div({ class: "flex items-center gap-x-4" }, [
			Icon(TicketIcon(ticket.priority)),
			Div({ class: "flex flex-col" }, [
				P({ class: "font-medium" }, Format.default("[[subject]]", "No subject")),
				P({ class: "text-sm text-muted-foreground" }, Format.default("[[owner]]", "Unassigned"))
			])
		]),
		Badge({ variant: ticket.status === "Open" ? "primary" : "secondary" }, Format.default("[[status]]", "Unknown"))
	])
);

/**
 * TicketsSection
 *
 * Shows recent tickets in a list.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const TicketsSection = Atom(({ client }) =>
	ProfileSection({ title: "Tickets" }, [
		new List({
			cache: "tickets",
			key: "id",
			items: client.tickets,
			role: "list",
			rowItem: TicketListItem
		})
	])
);

/**
 * InvoiceListItem
 *
 * Renders a single invoice as a row in the list.
 *
 * @param {object} client
 * @returns {function}
 */
const InvoiceListItem = (client) => (
	Atom((invoice) =>
		A({ href: `clients/client/${client.id}/billing/invoices/${invoice.id}` }, [
			Card({ class: "flex items-center justify-between cursor-pointer p-4", margin: "my-2", hover: true }, [
				Div({ class: "flex items-center gap-x-4" }, [
					Icon(Icons.document.default),
					Div({ class: "flex flex-col" }, [
						P({ class: "font-medium" }, Format.default("[[number]]", "N/A")),
						P({ class: "text-sm text-muted-foreground" }, Format.date("[[date]]", "No date"))
					])
				]),
				Div({ class: "flex items-center gap-x-4" }, [
					P({ class: "font-medium text-foreground" }, Format.money("[[amount]]", "$", "0.00")),
					Badge({ variant: invoice.status === "Paid" ? "secondary" : "outline" }, Format.default("[[status]]", "Unknown"))
				])
			])
		])
	)
);

/**
 * InvoicesSection
 *
 * Displays a list of previous invoices.
 *
 * @param {object} props
 * @param {object} props.client - The client object containing invoice data.
 * @returns {object}
 */
export const InvoicesSection = Atom(({ client }) =>
	ProfileSection({ title: "Previous Invoices" }, [
		new List({
			cache: "invoices",
			key: "id",
			items: [
				{ id: 1, number: "INV-1001", date: "May 1, 2024", amount: "$200.00", status: "Paid" },
				{ id: 2, number: "INV-1002", date: "Jun 1, 2024", amount: "$150.00", status: "Overdue" },
				{ id: 3, number: "INV-1003", date: "Jul 1, 2024", amount: "$175.00", status: "Paid" }
			],
			role: "list",
			rowItem: InvoiceListItem(client)
		})
	])
);

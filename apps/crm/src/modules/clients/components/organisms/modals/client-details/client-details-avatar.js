import { A, Div, H2, P, Span } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { Badge } from "@base-framework/ui/atoms";
import { Avatar } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";

/**
 * ClientDetailsAvatar
 *
 * Displays the client's avatar, company name, ID, location, and status.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @returns {object}
 */
export const ClientDetailsAvatar = Atom(({ client }) =>
	Div({ class: "flex items-center gap-x-4 pb-6" }, [
		A({ href: '/clients/[[client.id]]', class: 'inline-flex items-center' }, [
			Avatar({
				src: '[[client.avatar]]',
				alt: '[[client.companyName]]',
				watcherFallback: '[[client.companyName]]',
				size: "lg"
			})
		]),
		Div({ class: "flex flex-col gap-y-1 flex-1" }, [
			Div({ class: "flex items-baseline gap-x-2" }, [
				H2({ class: "text-2xl font-semibold text-foreground" },
					A({ href: '/clients/[[client.id]]', class: 'inline-block' }, Format.default('[[client.companyName]]', "Unnamed Client"))
				),
				P({ class: "text-sm text-muted-foreground" }, '#[[client.id]]')
			]),
			Div({ class: "flex items-center gap-x-2 flex-wrap" }, [
				Span({
					class: "text-sm text-muted-foreground",
					watch: ['[[client.city]][[client.state]]', ([city, state]) => {
						if (!city && !state) return '';
						return `${city || ''}${state ? (city ? ', ' : '') + state : ''}`;
					}]
				}),
				Badge({
					watch: ['[[client.status]]', (status) => ({
						variant: status === "active" ? "default" : "secondary"
					})]
				}, Format.default('[[client.status]]', "Unknown"))
			])
		])
	])
);

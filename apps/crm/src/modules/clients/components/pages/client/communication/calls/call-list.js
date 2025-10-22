import { Div, P } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Badge, Card, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { CallDetailsModal } from "./modals/call-details-modal.js";

/**
 * This will get the icon for the call status.
 *
 * @param {string} status - The call status.
 * @return {object} - The icon for the call status.
 */
const CallIcon = (status) =>
{
	switch (status)
	{
		case "missed":
			return Icon({ class: 'text-red-500' }, Icons.phone.missed);
		case "inbound":
			return Icon({ class: 'text-blue-500' }, Icons.phone.inbound);
		case "outbound":
			return Icon({ class: 'text-yellow-500' }, Icons.phone.outbound);
		case "voicemail":
			return Icon({ class: 'text-purple-500' }, Icons.voicemail);
		default:
			return Icon({ class: 'text-base' }, Icons.phone.default);
	}
};

/**
 * CallItem
 *
 * Renders a single call row as a card.
 *
 * @param {object} call
 * @param {function} onClick
 * @returns {object}
 */
const CallItem = (call, onClick) =>
{
	const displayName = call.callerName || call.recipientName || 'Unknown';
	const callType = call.callType || 'outbound';
	const duration = call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}` : '00:00';
	const startedAt = call.startedAt ? DateTime.format('standard', call.startedAt) : 'Not started';

	return Card({
		class: "flex items-center justify-between p-4 cursor-pointer",
		margin: "m-2",
		hover: true,
		click: (e, parent) => onClick && onClick(call, parent)
	}, [
		Div({ class: "flex items-center gap-x-4" }, [
			Avatar({
				src: call.avatar,
				alt: displayName,
				fallbackText: displayName,
				size: "sm"
			}),
			Div({ class: "flex flex-col" }, [
				P({ class: "font-medium m-0" }, call.subject || 'Untitled Call'),
				P({ class: "text-sm text-muted-foreground m-0" }, displayName),
				P({ class: "text-sm text-muted-foreground m-0" }, `${startedAt} • ${duration}`)
			])
		]),
		Div({ class: "flex items-center gap-2" }, [
			Badge({ type: call.priority === 'urgent' ? 'destructive' : call.priority === 'high' ? 'warning' : 'outline' },
				call.priority ? call.priority.toUpperCase() : 'NORMAL'
			),
			CallIcon(callType)
		])
	]);
};

/**
 * CallList
 *
 * Lists all of a client's calls.
 *
 * @param {object} props
 * @param {object} props.data
 * @returns {object}
 */
export const CallList = Atom(({ data }) =>
{
	/**
	 * Opens the call details modal
	 *
	 * @param {object} call
	 * @param {object} parent
	 */
	const openCallDetailsModal = (call, parent) =>
	{
		CallDetailsModal({
			call,
			clientId: data.clientId,
			onUpdate: (updatedData) =>
			{
				if (updatedData === null)
				{
					// Call was deleted, refresh the list
					parent?.refresh();
				}
				else
				{
					// Call was updated, update the list
					parent?.mingle([ updatedData.get() ]);
				}
			}
		});
	};

	return Div({ class: "flex flex-auto flex-col gap-y-6 mt-12" }, [
		ScrollableList({
			data,
			cache: "list",
			key: "id",
			role: "list",
			skeleton: true,
			rowItem: (call) => CallItem(call, openCallDetailsModal),
			emptyState: () => EmptyState({
				title: 'No Calls Found',
				description: 'No call records have been added for this client yet.',
				icon: Icons.phone.default
			})
		})
	]);
});
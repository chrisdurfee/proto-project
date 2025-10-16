import { Div, P, UseParent } from "@base-framework/atoms";
import { Data, DateTime } from "@base-framework/base";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DetailBody, DetailSection, DropdownMenu, Modal, SplitRow } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";
import { CallModal } from "./call-modal.js";

/**
 * Quick connect buttons for call actions.
 *
 * @returns {object}
 */
const QuickConnectButtons = () =>
	Div({ class: 'flex flex-auto items-center justify-center border-b pb-6' }, [
		Div({ class: 'flex gap-x-4' }, [
			Tooltip({ content: 'Call' }, [
				Button({
					variant: 'icon',
					icon: Icons.phone.default,
					label: 'Call',
					click: (e, parent) =>
					{
						const phone = parent.data.callerPhone || parent.data.recipientPhone;
						if (phone)
						{
							window.location.href = `tel:${phone}`;
						}
					}
				})
			]),
			Tooltip({ content: 'Play Recording' }, [
				Button({
					variant: 'icon',
					icon: Icons.play,
					label: 'Play Recording',
					click: (e, parent) =>
					{
						const recordingUrl = parent.data.recordingUrl;
						if (recordingUrl)
						{
							window.open(recordingUrl, '_blank');
						}
					}
				})
			]),
			Tooltip({ content: 'Message' }, [
				Button({
					variant: 'icon',
					icon: Icons.chat.text,
					label: 'Message'
				})
			]),
			Tooltip({ content: 'More' }, [
				Button({
					variant: 'icon',
					icon: Icons.ellipsis.vertical,
					label: 'More'
				})
			])
		])
	]);

/**
 * Call information section
 *
 * @returns {object}
 */
const CallInformation = () =>
	DetailSection({ title: 'Call Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Subject', '[[subject]]'),
			SplitRow('Call Type', '[[callTypeLabel]]'),
			SplitRow('Status', '[[callStatusLabel]]'),
			SplitRow('Priority', '[[priorityLabel]]'),
			SplitRow('Duration', '[[durationFormatted]]')
		])
	]);

/**
 * Participants section
 *
 * @returns {object}
 */
const ParticipantsSection = () =>
	DetailSection({ title: 'Participants' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Caller Name', '[[callerName]]'),
			SplitRow('Caller Phone', Format.phone('[[callerPhone]]', '-')),
			SplitRow('Recipient Name', '[[recipientName]]'),
			SplitRow('Recipient Phone', Format.phone('[[recipientPhone]]', '-'))
		])
	]);

/**
 * Call timing section
 *
 * @returns {object}
 */
const TimingSection = () =>
	DetailSection({ title: 'Call Timing' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Scheduled At', '[[scheduledAtFormatted]]'),
			SplitRow('Started At', '[[startedAtFormatted]]'),
			SplitRow('Ended At', '[[endedAtFormatted]]')
		])
	]);

/**
 * Outcome section
 *
 * @returns {object}
 */
const OutcomeSection = () =>
	DetailSection({ title: 'Call Outcome' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Outcome', '[[outcomeLabel]]'),
			SplitRow('Outcome Notes', P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[outcomeNotes]]'))
		])
	]);

/**
 * Follow-up section
 *
 * @returns {object}
 */
const FollowUpSection = () =>
	DetailSection({ title: 'Follow-up' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Requires Follow-up', '[[requiresFollowUpLabel]]'),
			SplitRow('Follow-up Date', '[[followUpAtFormatted]]'),
			SplitRow('Follow-up Notes', P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[followUpNotes]]'))
		])
	]);

/**
 * Recording section
 *
 * @returns {object}
 */
const RecordingSection = () =>
	DetailSection({ title: 'Recording & Notes' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Has Recording', '[[hasRecordingLabel]]'),
			SplitRow('Recording URL', '[[recordingUrl]]'),
			SplitRow('Tags', '[[tags]]'),
			SplitRow('Notes', P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[notes]]'))
		])
	]);

/**
 * Header options for the modal.
 *
 * @param {object} call - The call data
 * @param {string} clientId - The client ID
 * @param {function} onUpdate - Callback when call is updated
 * @returns {function}
 */
const HeaderOptions = (call, clientId, onUpdate) =>
{
	return () => [
		UseParent((parent) => (
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				groups: [
					[
						{ icon: Icons.pencil.square, label: 'Edit Call', value: 'edit-call' },
						{ icon: Icons.trash, label: 'Delete Call', value: 'delete-call' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'edit-call')
					{
						parent.close();

						CallModal({
							item: call,
							clientId,
							onSubmit: (data) =>
							{
								if (onUpdate)
								{
									onUpdate(data);
								}
							}
						});
					}
					else if (selected.value === 'delete-call')
					{
						// Use fetch to delete the call
						fetch(`/api/client/${clientId}/call/${call.id}`, {
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json'
							}
						})
						.then(res => res.json())
						.then((response) =>
						{
							if (!response || response.success === false)
							{
								app.notify({
									type: "destructive",
									title: "Error",
									description: "An error occurred while deleting the call.",
									icon: Icons.shield
								});
								return;
							}

							parent.destroy();

							app.notify({
								type: "success",
								title: "Call Deleted",
								description: "The call has been deleted.",
								icon: Icons.check
							});

							if (onUpdate)
							{
								onUpdate(null);
							}
						})
						.catch(() =>
						{
							app.notify({
								type: "destructive",
								title: "Error",
								description: "An error occurred while deleting the call.",
								icon: Icons.shield
							});
						});
					}
				}
			})
		))
	];
};

/**
 * Formats a label from a value
 *
 * @param {string} value
 * @returns {string}
 */
const formatLabel = (value) =>
{
	if (!value) return '-';
	return value.toString().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats a boolean to Yes/No
 *
 * @param {any} value
 * @returns {string}
 */
const formatBoolean = (value) =>
{
	const isTrue = value === 1 || value === true || value === '1' || value === 'true';
	return isTrue ? 'Yes' : 'No';
};

/**
 * Formats duration in seconds to mm:ss
 *
 * @param {number} seconds
 * @returns {string}
 */
const formatDuration = (seconds) =>
{
	if (!seconds || seconds === 0) return '00:00';
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Formats the call data for display
 *
 * @param {object} call
 * @returns {object}
 */
const formatCallData = (call) =>
{
	return {
		...call,
		subject: call.subject || 'Untitled Call',
		callTypeLabel: formatLabel(call.callType),
		callStatusLabel: formatLabel(call.callStatus),
		priorityLabel: formatLabel(call.priority),
		outcomeLabel: formatLabel(call.outcome),
		callerName: call.callerName || '-',
		callerPhone: call.callerPhone || '-',
		recipientName: call.recipientName || '-',
		recipientPhone: call.recipientPhone || '-',
		scheduledAtFormatted: call.scheduledAt ? DateTime.format('standard', call.scheduledAt) : '-',
		startedAtFormatted: call.startedAt ? DateTime.format('standard', call.startedAt) : '-',
		endedAtFormatted: call.endedAt ? DateTime.format('standard', call.endedAt) : '-',
		durationFormatted: formatDuration(call.duration),
		outcomeNotes: call.outcomeNotes || 'No outcome notes',
		requiresFollowUpLabel: formatBoolean(call.requiresFollowUp),
		followUpAtFormatted: call.followUpAt ? DateTime.format('standard', call.followUpAt) : '-',
		followUpNotes: call.followUpNotes || 'No follow-up notes',
		hasRecordingLabel: formatBoolean(call.hasRecording),
		recordingUrl: call.recordingUrl || '-',
		tags: call.tags || '-',
		notes: call.notes || 'No notes available'
	};
};

/**
 * CallDetailsModal
 *
 * A read-only modal showing call details with quick action buttons.
 *
 * @param {object} props
 * @param {object} props.call - The call data
 * @param {string} props.clientId - The client ID
 * @param {function} [props.onUpdate] - Callback when call is updated
 * @param {function} [props.onClose] - Callback when modal closes
 * @returns {object}
 */
export const CallDetailsModal = (props = { call: {}, clientId: '', onUpdate: undefined, onClose: undefined }) =>
{
	const call = props.call || {};
	const clientId = props.clientId || call.clientId;
	const closeCallback = (parent) => props.onClose && props.onClose(parent);

	return new Modal({
		title: formatCallData(call).subject,
		icon: Icons.phone.default,
		description: formatCallData(call).callTypeLabel,
		size: 'md',
		type: 'right',
		hidePrimaryButton: true,

		/**
		 * This will setup the data for the modal.
		 *
		 * @returns {Data}
		 */
		setData()
		{
			return new Data(formatCallData(call));
		},

		/**
		 * Header options for the modal.
		 */
		headerOptions: HeaderOptions(call, clientId, props.onUpdate),

		/**
		 * This will close the modal.
		 *
		 * @returns {void}
		 */
		onClose: closeCallback
	},
	[
		// Quick connect buttons
		QuickConnectButtons(),

		DetailBody([
			// Call Information Section
			CallInformation(),

			// Participants Section
			ParticipantsSection(),

			// Timing Section
			TimingSection(),

			// Outcome Section
			OutcomeSection(),

			// Follow-up Section
			FollowUpSection(),

			// Recording Section
			RecordingSection()
		])
	]).open();
};

import { Fieldset, Input, Select, Textarea } from "@base-framework/ui/atoms";
import { DatePicker, FormField, TimePicker } from "@base-framework/ui/molecules";

/**
 * CallForm
 *
 * Renders a form for creating or editing a client call.
 *
 * @param {object} props
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {object} props.call - The call data
 * @returns {Array}
 */
export const CallForm = ({ isEditing = false, call }) => [
	Fieldset({ legend: "Call Information" }, [
		new FormField({ name: "subject", label: "Subject", description: "Brief description of the call.", required: true }, [
			Input({
				type: "text",
				placeholder: "Quarterly review discussion",
				bind: 'subject',
				required: true
			})
		]),
		new FormField({ name: "callType", label: "Call Type", description: "Type of call.", required: true }, [
			Select({
				bind: 'callType',
				options: [
					{ label: 'Inbound', value: 'inbound' },
					{ label: 'Outbound', value: 'outbound' },
					{ label: 'Missed', value: 'missed' },
					{ label: 'Voicemail', value: 'voicemail' }
				]
			})
		]),
		new FormField({ name: "callStatus", label: "Call Status", description: "Current status of the call.", required: true }, [
			Select({
				bind: 'callStatus',
				options: [
					{ label: 'Scheduled', value: 'scheduled' },
					{ label: 'In Progress', value: 'in_progress' },
					{ label: 'Completed', value: 'completed' },
					{ label: 'Missed', value: 'missed' },
					{ label: 'Cancelled', value: 'cancelled' },
					{ label: 'No Answer', value: 'no_answer' }
				]
			})
		]),
		new FormField({ name: "priority", label: "Priority", description: "Call priority level." }, [
			Select({
				bind: 'priority',
				options: [
					{ label: 'Low', value: 'low' },
					{ label: 'Normal', value: 'normal' },
					{ label: 'High', value: 'high' },
					{ label: 'Urgent', value: 'urgent' }
				]
			})
		])
	]),

	Fieldset({ legend: "Participants" }, [
		new FormField({ name: "callerName", label: "Caller Name", description: "Name of the person calling." }, [
			Input({
				type: "text",
				placeholder: "John Doe",
				bind: 'callerName'
			})
		]),
		new FormField({ name: "callerPhone", label: "Caller Phone", description: "Phone number of the caller." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 123-4567",
				bind: 'callerPhone'
			})
		]),
		new FormField({ name: "recipientName", label: "Recipient Name", description: "Name of the person receiving the call." }, [
			Input({
				type: "text",
				placeholder: "Jane Smith",
				bind: 'recipientName'
			})
		]),
		new FormField({ name: "recipientPhone", label: "Recipient Phone", description: "Phone number of the recipient." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 987-6543",
				bind: 'recipientPhone'
			})
		])
	]),

	Fieldset({ legend: "Call Timing" }, [
		new FormField({ name: "scheduledAt", label: "Scheduled Date & Time", description: "When the call is scheduled." }, [
			new DatePicker({
				bind: 'scheduledAt'
			}),
			new TimePicker({
				bind: 'scheduledAt'
			})
		]),
		new FormField({ name: "startedAt", label: "Started Date & Time", description: "When the call started." }, [
			new DatePicker({
				bind: 'startedAt'
			}),
			new TimePicker({
				bind: 'startedAt'
			})
		]),
		new FormField({ name: "endedAt", label: "Ended Date & Time", description: "When the call ended." }, [
			new DatePicker({
				bind: 'endedAt'
			}),
			new TimePicker({
				bind: 'endedAt'
			})
		]),
		new FormField({ name: "duration", label: "Duration (seconds)", description: "Call duration in seconds." }, [
			Input({
				type: "number",
				placeholder: "300",
				bind: 'duration',
				min: 0
			})
		])
	]),

	Fieldset({ legend: "Call Outcome" }, [
		new FormField({ name: "outcome", label: "Outcome", description: "Result of the call." }, [
			Select({
				bind: 'outcome',
				options: [
					{ label: 'Successful', value: 'successful' },
					{ label: 'Busy', value: 'busy' },
					{ label: 'No Answer', value: 'no_answer' },
					{ label: 'Voicemail', value: 'voicemail' },
					{ label: 'Disconnected', value: 'disconnected' },
					{ label: 'Other', value: 'other' }
				]
			})
		]),
		new FormField({ name: "outcomeNotes", label: "Outcome Notes", description: "Additional notes about the outcome." }, [
			Textarea({
				placeholder: "Add outcome notes...",
				bind: 'outcomeNotes',
				rows: 3
			})
		])
	]),

	Fieldset({ legend: "Follow-up" }, [
		new FormField({ name: "requiresFollowUp", label: "Requires Follow-up", description: "Does this call require follow-up?" }, [
			Select({
				bind: 'requiresFollowUp',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "followUpAt", label: "Follow-up Date & Time", description: "When to follow up." }, [
			new DatePicker({
				bind: 'followUpAt'
			}),
			new TimePicker({
				bind: 'followUpAt'
			})
		]),
		new FormField({ name: "followUpNotes", label: "Follow-up Notes", description: "Notes for the follow-up." }, [
			Textarea({
				placeholder: "Add follow-up notes...",
				bind: 'followUpNotes',
				rows: 3
			})
		])
	]),

	Fieldset({ legend: "Recording & Notes" }, [
		new FormField({ name: "hasRecording", label: "Has Recording", description: "Does this call have a recording?" }, [
			Select({
				bind: 'hasRecording',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "recordingUrl", label: "Recording URL", description: "URL to the call recording." }, [
			Input({
				type: "url",
				placeholder: "https://example.com/recordings/call123.mp3",
				bind: 'recordingUrl'
			})
		]),
		new FormField({ name: "notes", label: "Notes", description: "Additional notes about this call." }, [
			Textarea({
				placeholder: "Add any notes about this call...",
				bind: 'notes',
				rows: 4
			})
		])
	]),

	Fieldset({ legend: "Tags" }, [
		new FormField({ name: "tags", label: "Tags", description: "Comma-separated tags for this call." }, [
			Input({
				type: "text",
				placeholder: "important, follow-up, quote",
				bind: 'tags'
			})
		])
	])
];

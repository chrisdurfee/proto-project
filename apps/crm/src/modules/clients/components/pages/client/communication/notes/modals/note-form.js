import { Fieldset, Input, Select, Textarea } from "@base-framework/ui/atoms";
import { DatePicker, FormField, TimePicker } from "@base-framework/ui/molecules";

/**
 * NoteForm
 *
 * Renders a form for creating or editing a client note.
 *
 * @param {object} props
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {object} props.note - The note data
 * @returns {Array}
 */
export const NoteForm = ({ isEditing = false, note }) => [
	Fieldset({ legend: "Note Information" }, [
		new FormField({ name: "title", label: "Title", description: "Brief title for this note.", required: true }, [
			Input({
				type: "text",
				placeholder: "Meeting summary, important update, etc.",
				bind: 'title',
				required: true
			})
		]),
		new FormField({ name: "content", label: "Content", description: "Detailed note content.", required: true }, [
			Textarea({
				placeholder: "Add your notes here...",
				bind: 'content',
				rows: 6,
				required: true
			})
		]),
		new FormField({ name: "noteType", label: "Note Type", description: "Type of note.", required: true }, [
			Select({
				bind: 'noteType',
				options: [
					{ label: 'General', value: 'general' },
					{ label: 'Meeting', value: 'meeting' },
					{ label: 'Call', value: 'call' },
					{ label: 'Email', value: 'email' },
					{ label: 'Task', value: 'task' },
					{ label: 'Follow-up', value: 'follow_up' },
					{ label: 'Important', value: 'important' },
					{ label: 'Other', value: 'other' }
				]
			})
		]),
		new FormField({ name: "priority", label: "Priority", description: "Note priority level." }, [
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

	Fieldset({ legend: "Visibility & Status" }, [
		new FormField({ name: "visibility", label: "Visibility", description: "Who can see this note?" }, [
			Select({
				bind: 'visibility',
				options: [
					{ label: 'Private (Only me)', value: 'private' },
					{ label: 'Team', value: 'team' },
					{ label: 'Client', value: 'client' }
				]
			})
		]),
		new FormField({ name: "status", label: "Status", description: "Note status." }, [
			Select({
				bind: 'status',
				options: [
					{ label: 'Active', value: 'active' },
					{ label: 'Archived', value: 'archived' }
				]
			})
		]),
		new FormField({ name: "isPinned", label: "Pin Note", description: "Pin this note to the top?" }, [
			Select({
				bind: 'isPinned',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		])
	]),

	Fieldset({ legend: "Reminder" }, [
		new FormField({ name: "hasReminder", label: "Set Reminder", description: "Do you want to be reminded about this note?" }, [
			Select({
				bind: 'hasReminder',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "reminderAt", label: "Reminder Date & Time", description: "When to be reminded." }, [
			new DatePicker({
				bind: 'reminderAt'
			}),
			new TimePicker({
				bind: 'reminderAt'
			})
		])
	]),

	Fieldset({ legend: "Follow-up" }, [
		new FormField({ name: "requiresFollowUp", label: "Requires Follow-up", description: "Does this note require follow-up?" }, [
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

	Fieldset({ legend: "Attachments & Tags" }, [
		new FormField({ name: "hasAttachments", label: "Has Attachments", description: "Does this note have attachments?" }, [
			Select({
				bind: 'hasAttachments',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "attachmentUrls", label: "Attachment URLs", description: "Comma-separated URLs to attachments." }, [
			Textarea({
				placeholder: "https://example.com/file1.pdf, https://example.com/file2.jpg",
				bind: 'attachmentUrls',
				rows: 2
			})
		]),
		new FormField({ name: "tags", label: "Tags", description: "Comma-separated tags for this note." }, [
			Input({
				type: "text",
				placeholder: "important, follow-up, meeting",
				bind: 'tags'
			})
		])
	])
];

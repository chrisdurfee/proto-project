import { Div, H1, P } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Button, Input, Textarea } from "@base-framework/ui/atoms";
import { Form, FormCard, FormCardGroup, FormField } from "@base-framework/ui/molecules";
import { Page } from "@base-framework/ui/pages";
import { SupportMessageModel } from "../../models/support-message-model.js";

/**
 * Whether a visitor is signed in.
 *
 * A signed-out visitor must supply a reply address, since the API has
 * no account to attach the message to.
 *
 * @returns {boolean}
 */
const isSignedIn = () => !!(app.data?.user?.id);

/**
 * Submits the form and reports the outcome.
 *
 * @param {string} category
 * @param {object} data
 * @returns {void}
 */
const submitMessage = (category, data) =>
{
	if (data.get('submitting') === true)
	{
		return;
	}

	data.set('submitting', true);

	const payload = {
		category,
		subject: data.get('subject'),
		message: data.get('message')
	};

	if (!isSignedIn())
	{
		payload.email = data.get('email');
	}

	const model = new SupportMessageModel(payload);
	model.xhr.add('', (response) =>
	{
		data.set('submitting', false);

		if (!response || response.success === false)
		{
			app.notify({
				type: 'destructive',
				title: 'Message not sent',
				description: 'Something went wrong sending your message. Please try again.',
				icon: 'shield'
			});
			return;
		}

		data.set('submitted', true);
		data.set('subject', '');
		data.set('message', '');

		app.notify({
			type: 'success',
			title: 'Message sent',
			description: 'Thanks. We received your message and will follow up.',
			icon: 'check'
		});
	});
};

/**
 * Builds the fields for the form.
 *
 * @param {string} messagePlaceholder
 * @returns {Array<object>}
 */
const Fields = (messagePlaceholder) =>
{
	const fields = [];

	if (!isSignedIn())
	{
		fields.push(new FormField({
			name: 'email',
			label: 'Email',
			description: 'Where we should send our reply.'
		}, [
			Input({ type: 'email', placeholder: 'you@example.com', bind: 'email', required: true })
		]));
	}

	fields.push(new FormField({
		name: 'subject',
		label: 'Subject',
		description: 'A short summary.'
	}, [
		Input({ placeholder: 'Summarize it in a sentence', bind: 'subject', required: true, maxLength: 255 })
	]));

	fields.push(new FormField({
		name: 'message',
		label: 'Details',
		description: 'The more specific you are, the faster we can help.'
	}, [
		Textarea({ placeholder: messagePlaceholder, bind: 'message', required: true, rows: 8 })
	]));

	return fields;
};

/**
 * SupportForm
 *
 * The submission form shared by the contact and report-a-problem
 * pages. Covers the in-flight, error, and success states, not only the
 * happy path.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.category One of support, bug, or contact.
 * @param {string} props.submitLabel
 * @param {string} props.messagePlaceholder
 * @returns {Page}
 */
export const SupportForm = ({ title, description, category, submitLabel, messagePlaceholder }) =>
{
	const data = new Data({
		subject: '',
		message: '',
		email: '',
		submitting: false,
		submitted: false
	});

	return new Page({ data }, [
		Div({ class: 'flex flex-auto flex-col w-full max-w-2xl mx-auto px-4 py-8 gap-y-6' }, [
			Div({ class: 'flex flex-col gap-y-2' }, [
				H1({ class: 'scroll-m-20 text-3xl font-bold tracking-tight' }, title),
				P({ class: 'text-base text-muted-foreground max-w-[700px]' }, description)
			]),

			Div({
				onSet: ['submitted', {
					true: Div({ class: 'rounded-card border border-border bg-card p-4' }, [
						P({ class: 'font-medium text-foreground' }, 'Thanks, your message is on its way.'),
						P({ class: 'text-sm text-muted-foreground mt-1' }, 'We will reply as soon as we can.')
					])
				}]
			}),

			Form({
				class: 'flex flex-col gap-y-8',
				submit: (formData, parent) => submitMessage(category, parent.data)
			}, [
				FormCard({ title: 'Your message' }, [
					FormCardGroup({ border: false }, [
						Div({ class: 'flex flex-col gap-y-6' }, Fields(messagePlaceholder))
					])
				]),
				Div({ class: 'flex justify-end' }, [
					Button({
						type: 'submit',
						variant: 'primary',
						disabled: ['submitting']
					}, submitLabel)
				])
			])
		])
	]);
};

export default SupportForm;

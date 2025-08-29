import { Div } from "@base-framework/atoms";
import { Model } from "@base-framework/base";
import { Fieldset, Input } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { FormField, Modal } from "@base-framework/ui/molecules";

/**
 * getEmailForm
 *
 * Returns an array of form fields for creating a new email.
 *
 * @returns {Array} - Array of form field components.
 */
const getEmailForm = () => ([
    Fieldset({ legend: "Email Settings" }, [
        new FormField(
            { name: "email", label: "Email", description: "Enter the email address." },
            [
                Input({ type: "email", placeholder: "e.g. user@example.com", required: true, bind: "email" })
            ]
        )
    ])
]);

/**
 * EmailModel
 *
 * This model is used to handle the email model.
 *
 * @type {typeof Model}
 */
export const EmailModel = Model.extend({
    url: '/api/developer/email',

    xhr: {
        /**
         * This will test the email.
         *
         * @param {object} instanceParams
         * @param {function} callBack
         * @returns {object}
         */
		test(instanceParams, callBack)
        {
			const data = this.model.get();
            let params = 'to=' + data.email +
				'&template=' + (data.template || '');

            return this._post('test', params, instanceParams, callBack);
        }
    }
});

/**
 * TestEmailModal
 *
 * A modal for testing an email template.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const TestEmailModal = (props = {}) =>
{
    const template = props.template || {};

    return new Modal({
        data: new EmailModel({
            email: '',
            template
        }),
        title: 'Test Email',
        icon: Icons.at,
        description: 'Test the email template.',
        size: 'md',
        type: 'right',
        onSubmit({ data })
        {
            this.data.xhr.test('', (response) =>
            {
                if (!response || response.success === false)
                {
                    app.notify({
                        type: "destructive",
                        title: "Error",
                        description: "An error occurred while testing the email.",
                        icon: Icons.shield
                    });
                    return;
                }

                app.notify({
                    type: "success",
                    title: "Email Test Successful",
                    description: "The email has been sent successfully.",
                    icon: Icons.check
                });
            });
        }
    }, [
        Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
            Div({ class: "flex flex-auto flex-col w-full gap-4" }, getEmailForm())
        ])
    ]).open();
};
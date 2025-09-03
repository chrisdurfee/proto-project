import { Div, H4, P } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { FormCard, FormCardContent, FormCardGroup, FormField, Toggle } from "@base-framework/ui/molecules";
import { Page } from "@base-framework/ui/pages";
import { SettingsSection } from "../atoms/settings-section.js";

/**
 * @type {object}
 */
const Props =
{
    data: app.data.user
};

/**
 * NotificationSettings
 *
 * Settings for configuring notification preferences.
 *
 * @returns {object}
 */
export const NotificationSettings = () => (
    new Page(Props, [
        SettingsSection({
            title: 'Notifications',
            description: 'Manage your notification preferences.',
            class: 'max-w-5xl mx-auto',
            submit: (data, parent) =>
            {
                parent.data.xhr.update('', (response) =>
				{
					if (!response || response.success === false)
					{
						app.notify({
							type: "destructive",
							title: "Error",
							description: "An error occurred while updating the profile.",
							icon: Icons.shield
						});
						return;
					}

					app.notify({
						type: "success",
						title: "Profile Updated",
						description: "The profile has been updated.",
						icon: Icons.check
					});
				});
            }
        }, [

            // Notification toggles wrapped in a FormCard
            FormCard({ title: 'Notification Preferences' }, [

                // Each toggle in its own FormCardGroup for consistent spacing/border
                FormCardGroup({ label: 'Allowed Notifications', description: '', border: true }, [
                    Div({ class: 'flex flex-col gap-y-4' }, [

                        // Email Notifications
                        Div({ class: 'flex items-center justify-between p-4 bg-muted/10 border border-muted-foreground/20 rounded-md' }, [
                            Div({ class: 'flex flex-col pr-8' }, [
                                H4({ class: 'font-semibold' }, 'Email Notifications'),
                                P({ class: 'text-sm text-muted-foreground' }, 'Receive email notifications for important updates.')
                            ]),
                            new Toggle({
                                bind: 'allowEmail',
                            })
                        ]),

                        // Push Notifications
                        Div({ class: 'flex items-center justify-between p-4 bg-muted/10 border border-muted-foreground/20 rounded-md' }, [
                            Div({ class: 'flex flex-col pr-8' }, [
                                H4({ class: 'font-semibold' }, 'Push Notifications'),
                                P({ class: 'text-sm text-muted-foreground' }, 'Receive push notifications for important updates.')
                            ]),
                            new Toggle({
                                bind: 'allowPush',
                            })
                        ]),

                        // SMS Notifications
                        Div({ class: 'flex items-center justify-between p-4 bg-muted/10 border border-muted-foreground/20 rounded-md' }, [
                            Div({ class: 'flex flex-col pr-8' }, [
                                H4({ class: 'font-semibold' }, 'SMS Notifications'),
                                P({ class: 'text-sm text-muted-foreground' }, 'Receive SMS notifications for important updates.')
                            ]),
                            new Toggle({
                                bind: 'allowSms',
                            })
                        ])
                    ])
                ])
            ]),

            // Preferences
            FormCard({ title: "Preferences" }, [
                FormCardGroup({ label: "Marketing Opt-In", description: "", border: true }, [
                    new FormField({
                        name: "marketingOptIn",
                        label: "",
                        description: "Receive marketing emails and updates."
                    }, [
                        new Toggle({
                            bind: 'marketingOptIn'
                        })
                    ])
                ])
            ]),

            // Save button
            FormCardContent([
                Div({ class: 'mt-4 flex justify-end' }, [
                    Button({ variant: 'primary', type: 'submit' }, 'Save Preferences')
                ])
            ])
        ])
    ])
);

export default NotificationSettings;

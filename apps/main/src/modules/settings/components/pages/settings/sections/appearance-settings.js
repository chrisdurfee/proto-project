import { FormCard, FormCardGroup, FormField, ThemeToggle } from "@base-framework/ui/molecules";
import { Page } from "@base-framework/ui/pages";
import { SettingsSection } from "../atoms/settings-section.js";

/**
 * AppearanceSettings
 *
 * Settings for customizing the app’s appearance, converted to new FormCard system.
 *
 * @returns {object}
 */
export const AppearanceSettings = () => (
    new Page([
        SettingsSection({
            title: 'Appearance',
            description: 'Customize the appearance of the app.',
            class: 'max-w-5xl mx-auto',
            submit: (data) => console.log("Appearance Settings:", data)
        }, [
            FormCard({ title: '' }, [
                FormCardGroup({
                    label: 'Theme',
                    description: '',
                    border: true
                }, [
                    new FormField({
                        name: 'theme',
                        label: '',
                        description: ''
                    }, [
                        new ThemeToggle()
                    ])
                ])
            ])
        ])
    ])
);

export default AppearanceSettings;

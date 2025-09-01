import { Div } from "@base-framework/atoms";
import { DatePicker } from "@base-framework/ui";
import { Button, Input, NumberInput, Select, Textarea } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import {
    FormCard,
    FormCardGroup,
    FormField,
    LogoUploader,
    Toggle
} from "@base-framework/ui/molecules";
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
 * ProfileSettings
 *
 * Settings form for updating all user-editable fields.
 *
 * @returns {object}
 */
export const ProfileSettings = () => (
    new Page(Props, [
        SettingsSection({
            title: "Profile",
            description: "Update your personal and contact information. Some fields are managed by the platform and cannot be changed here.",
            class: "flex flex-col max-w-5xl mx-auto gap-y-6",
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
                })
            }
        }, [

            // Public Profile
            FormCard({
                title: "Public Profile",
                description: "These fields control how you appear to other users."
            }, [
                FormCardGroup({ label: "Display Name", description: "", border: true }, [
                    new FormField({
                        name: "displayName",
                        label: "",
                        description: "Your public display name (must meet our terms of service)."
                    }, [
                        Input({ placeholder: "e.g. John Doe", bind: 'displayName', required: true })
                    ])
                ]),
                FormCardGroup({ label: "Profile Image", description: "", border: true }, [
                    new FormField({
                        name: "image",
                        label: "",
                        description: "Your avatar, shown on your profile."
                    }, [
                        new LogoUploader({
                            src: "",
                            onChange: (file, parent) => console.log("Avatar file:", file, parent)
                        })
                    ])
                ]),
                // FormCardGroup({ label: "Cover Image", description: "", border: true }, [
                //     new FormField({
                //         name: "coverImageUrl",
                //         label: "",
                //         description: "A banner image for your profile."
                //     }, [
                //         new LogoUploader({
                //             src: "",
                //             onChange: (file, parent) => console.log("Cover image file:", file, parent)
                //         })
                //     ])
                // ]),
                FormCardGroup({ label: "Bio", description: "", border: true }, [
                    new FormField({
                        name: "bio",
                        label: "",
                        description: "A short biography or description."
                    }, [
                        Textarea({ placeholder: "Tell us about yourself", bind: 'bio' })
                    ])
                ])
            ]),

            // Personal Information
            FormCard({ title: "Personal Information" }, [
                FormCardGroup({ label: "Name", description: "", border: true }, [
                    new FormField({
                        name: "firstName",
                        label: "First Name",
                        description: "Your given name."
                    }, [
                        Input({ placeholder: "e.g. John", bind: 'firstName', required: true })
                    ]),
                    new FormField({
                        name: "lastName",
                        label: "Last Name",
                        description: "Your family name."
                    }, [
                        Input({ placeholder: "e.g. Doe", bind: 'lastName', required: true })
                    ])
                ]),
                FormCardGroup({ label: "Date of Birth", description: "", border: true }, [
                    new FormField({
                        name: "dob",
                        label: "",
                        description: "Your birth date."
                    }, [
                        new DatePicker({ type: "date", bind: 'dob', required: true })
                    ])
                ]),
                FormCardGroup({ label: "Gender", description: "", border: true }, [
                    new FormField({
                        name: "gender",
                        label: "",
                        description: "Your gender identity."
                    }, [
                        Select({
                            bind: 'gender',
                            options: [
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "other", label: "Other" },
                                { value: "prefer_not", label: "Prefer not to say" }
                            ]
                        })
                    ])
                ])
            ]),

            // Contact & Location
            FormCard({ title: "Contact & Location" }, [
                FormCardGroup({ label: "Email Address", description: "", border: true }, [
                    new FormField({
                        name: "email",
                        label: "",
                        description: "Your primary email."
                    }, [
                        Input({ type: "email", placeholder: "e.g. you@example.com", bind: 'email', required: true })
                    ])
                ]),
                FormCardGroup({ label: "Mobile Phone", description: "", border: true }, [
                    new FormField({
                        name: "mobile",
                        label: "",
                        description: "Your mobile number."
                    }, [
                        Input({ placeholder: "e.g. +1234567890", bind: 'mobile' })
                    ])
                ]),
                FormCardGroup({ label: "Mailing Address", description: "", border: true }, [
                    new FormField({
                        name: "street1",
                        label: "Street Address 1",
                        description: "House number and street name."
                    }, [
                        Input({ placeholder: "e.g. 123 Main St", bind: 'street1' })
                    ]),
                    new FormField({
                        name: "street2",
                        label: "Street Address 2",
                        description: "Apartment, suite, etc. (optional)."
                    }, [
                        Input({ placeholder: "e.g. Apt 4B", bind: 'street2' })
                    ]),
                    Div({ class: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                        new FormField({
                            name: "city",
                            label: "City",
                            description: ""
                        }, [
                            Input({ placeholder: "e.g. Springfield", bind: 'city' })
                        ]),
                        new FormField({
                            name: "state",
                            label: "State",
                            description: ""
                        }, [
                            Input({ placeholder: "e.g. CA", bind: 'state' })
                        ]),
                        new FormField({
                            name: "postalCode",
                            label: "Postal Code",
                            description: ""
                        }, [
                            NumberInput({ placeholder: "e.g. 12345", bind: 'postalCode' })
                        ]),
                    ]),
                    new FormField({
                        name: "country",
                        label: "Country",
                        description: "Your country of residence."
                    }, [
                        Select({
                            bind: "country",
                            options: [
                                { value: "us", label: "United States" },
                                { value: "ca", label: "Canada" },
                                { value: "mx", label: "Mexico" },
                                { value: "ch", label: "Switzerland" },
                                { value: "cn", label: "China" },
                                { value: "ru", label: "Russia" },
                                { value: "br", label: "Brazil" },
                                { value: "fr", label: "France" },
                                { value: "es", label: "Spain" },
                                { value: "pt", label: "Portugal" },
                                { value: "de", label: "Germany" },
                                { value: "it", label: "Italy" },
                                { value: "nl", label: "Netherlands" },
                                { value: "se", label: "Sweden" },
                                { value: "no", label: "Norway" },
                                { value: "dk", label: "Denmark" },
                                { value: "gb", label: "United Kingdom" },
                                { value: "in", label: "India" },
                                { value: "jp", label: "Japan" },
                                { value: "au", label: "Australia" }
                            ]
                        })
                    ]),
                ]),

                FormCardGroup({ label: "Locale", description: "", border: true }, [
                    new FormField({
                        name: "language",
                        label: "Language",
                        description: ""
                    }, [
                        Select({
                            bind: 'language',
                            options: [
                                { value: "en", label: "English" }
                            ]
                        })
                    ]),
                    new FormField({
                        name: "timezone",
                        label: "Timezone",
                        description: ""
                    }, [
                        Select({
                            bind: 'timezone',
                            options: [
                                { value: "utc", label: "UTC" },
                                { value: "est", label: "Eastern Standard Time" },
                                { value: "pst", label: "Pacific Standard Time" },
                                { value: "cst", label: "Central Standard Time" },
                                { value: "mst", label: "Mountain Standard Time" },
                                { value: "gmt", label: "Greenwich Mean Time" },
                                { value: "cet", label: "Central European Time" },
                                { value: "eet", label: "Eastern European Time" },
                                { value: "ist", label: "Indian Standard Time" },
                                { value: "jst", label: "Japan Standard Time" },
                                { value: "aest", label: "Australian Eastern Standard Time" }
                            ]
                        })
                    ]),
                    new FormField({
                        name: "currency",
                        label: "Currency",
                        description: ""
                    }, [
                        Select({
                            bind: 'currency',
                            options: [
                                { value: "usd", label: "US Dollar" },
                                { value: "cad", label: "Canadian Dollar" },
                                { value: "chf", label: "Swiss Franc" },
                                { value: "cny", label: "Chinese Yuan" },
                                { value: "rub", label: "Russian Ruble" },
                                { value: "brl", label: "Brazilian Real" },
                                { value: "eur", label: "Euro" },
                                { value: "gbp", label: "British Pound" },
                                { value: "inr", label: "Indian Rupee" },
                                { value: "jpy", label: "Japanese Yen" },
                                { value: "aud", label: "Australian Dollar" }
                            ]
                        })
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
                            bind: 'marketingOptIn',
                            active: false,
                            change: (val) => console.log("Marketing Opt-In:", val)
                        })
                    ])
                ])
            ]),

            // Save button
            Div({ class: "mt-4 flex justify-end" }, [
                Button({ variant: "primary", type: 'submit' }, "Save Profile")
            ])

        ])
    ])
);

export default ProfileSettings;

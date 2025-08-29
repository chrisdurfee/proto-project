import { Code, H4, P, Pre, Section } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../doc-page.js";

/**
 * CodeBlock
 *
 * Creates a code block with copy-to-clipboard functionality.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const CodeBlock = Atom((props, children) => (
	Pre(
		{
			...props,
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto
					 rounded-lg border bg-muted whitespace-break-spaces
					 break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: 'font-mono flex-auto text-sm text-wrap',
					click: () => {
						navigator.clipboard.writeText(children[0].textContent);
						// @ts-ignore
						app.notify({
							title: "Code copied",
							description: "The code has been copied to your clipboard.",
							icon: null
						});
					}
				},
				children
			)
		]
	)
));

/**
 * SecurityPage
 *
 * This page documents security concepts and best practices for Proto applications.
 *
 * @returns {DocPage}
 */
export const SecurityPage = () =>
	DocPage(
		{
			title: 'Security Best Practices',
			description: 'Learn about security concepts, patterns, and best practices for building secure Proto applications.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Security is a critical aspect of web application development. This page covers
					general security concepts, best practices, and patterns that should be implemented
					in Proto applications to protect against common vulnerabilities and attacks.`
				)
			]),

			// Input Validation and Sanitization
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Input Validation and Sanitization'),
				P({ class: 'text-muted-foreground' },
					`Always validate and sanitize user input to prevent injection attacks and XSS.
					Proto includes utilities in Proto\\Utils\\Filter for sanitization and validation.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Utils\\Filter\\Sanitize;
use Proto\\Utils\\Filter\\Validate;

/**
 * Example input sanitization and validation
 */
class InputHandler
{
    public function processUserInput(array $input): array
    {
        $sanitized = [];

        // Sanitize string inputs
        if (isset($input['name'])) {
            $sanitized['name'] = Sanitize::string($input['name']);
        }

        // Sanitize and validate email
        if (isset($input['email'])) {
            $email = Sanitize::email($input['email']);
            if (Validate::email($email)) {
                $sanitized['email'] = $email;
            }
        }

        // Sanitize numeric inputs
        if (isset($input['age'])) {
            $age = Sanitize::int($input['age']);
            if (Validate::int($age, ['min' => 0, 'max' => 150])) {
                $sanitized['age'] = $age;
            }
        }

        // Sanitize HTML content
        if (isset($input['content'])) {
            $sanitized['content'] = Sanitize::html($input['content']);
        }

        return $sanitized;
    }
}

// Basic sanitization examples
$clean_string = Sanitize::string($user_input);
$clean_email = Sanitize::email($email_input);
$clean_int = Sanitize::int($number_input);
$clean_html = Sanitize::html($html_content);

// Validation examples
$is_valid_email = Validate::email($email);
$is_valid_int = Validate::int($number, ['min' => 1, 'max' => 100]);
$is_valid_string = Validate::string($text, ['min_length' => 3, 'max_length' => 50]);
`
				)
			])
		]
	);

export default SecurityPage;

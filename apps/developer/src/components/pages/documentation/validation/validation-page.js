import { Code, H4, Li, P, Pre, Section, Ul } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DocPage } from "../../types/doc/doc-page.js";

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
 * ValidationPage
 *
 * This page documents Proto's validation system using Proto\Api\Validator
 * and Proto\Utils\Filter classes.
 *
 * @returns {DocPage}
 */
export const ValidationPage = () =>
	DocPage(
		{
			title: 'Input Validation System',
			description: 'Learn how to implement input validation and sanitization using Proto\'s built-in validation system.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Proto provides a built-in validation system through the Proto\\Api\\Validator class that can validate
					and sanitize data based on rule arrays. The system includes built-in validation and sanitization
					methods from Proto\\Utils\\Filter\\Validate and Proto\\Utils\\Filter\\Sanitize.`
				)
			]),

			// Basic Validation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Basic Validation with Proto\\Api\\Validator'),
				P({ class: 'text-muted-foreground' },
					`Use Proto's built-in Validator class to validate and sanitize data using rule arrays:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;

class UserController extends ApiController
{
    /**
     * Create a new user with validation.
     */
    public function create(): object
    {
        $data = $this->request->input();

        // Define validation rules
        $rules = [
            'name' => 'string:100|required',
            'email' => 'email:255|required',
            'password' => 'string:255|required',
            'age' => 'int:3',
            'phone' => 'string:20',
            'website' => 'url:255'
        ];

        // Create validator instance
        $validator = new Validator($data, $rules);

        // Check if validation passed
        if (!$validator->isValid()) {
            return $this->error([
                'message' => 'Validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Data is now validated and sanitized
        $user = User::create($data);
        return $this->success($user);
    }

    /**
     * Using the static create method
     */
    public function update(): object
    {
        $data = $this->request->input();

        $rules = [
            'name' => 'string:100',
            'email' => 'email:255',
            'bio' => 'string:500'
        ];

        // Static method for creating validator
        $validator = Validator::create($data, $rules);

        if (!$validator->isValid()) {
            return $this->error([
                'message' => $validator->getMessage(), // Get concatenated error string
                'errors' => $validator->getErrors()
            ], 422);
        }

        return $this->success($data);
    }
}`
				)
			]),

			// Validation Rules
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Available Validation Rules'),
				P({ class: 'text-muted-foreground' },
					`Proto validation rules follow the pattern 'type:maxLength|required'. The validation
					system uses Proto\\Utils\\Filter\\Validate for validation and Proto\\Utils\\Filter\\Sanitize
					for sanitization.`
				),
				CodeBlock(
`// Rule format: 'type:maxLength|required'
$rules = [
    'name' => 'string:100|required',    // Required string, max 100 chars
    'email' => 'email:255|required',    // Required email, max 255 chars
    'age' => 'int:3',                   // Optional integer, max 3 digits
    'website' => 'url:255',             // Optional URL, max 255 chars
    'phone' => 'string:20',             // Optional string, max 20 chars
    'description' => 'string:1000|required' // Required string, max 1000 chars
];

// The validator will:
// 1. Check if required fields are present
// 2. Sanitize the value using the appropriate method
// 3. Validate the value using the appropriate method
// 4. Check length constraints if specified`
				)
			]),

			// Sanitization and Validation Methods
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Sanitization & Validation Methods'),
				P({ class: 'text-muted-foreground' },
					`Proto provides sanitization through Proto\\Utils\\Filter\\Sanitize and validation
					through Proto\\Utils\\Filter\\Validate. You can also use these directly.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Utils\\Filter\\Sanitize;
use Proto\\Utils\\Filter\\Validate;

// Direct sanitization
$cleanString = Sanitize::string($userInput);
$cleanEmail = Sanitize::email($emailInput);
$cleanUrl = Sanitize::url($urlInput);
$cleanInt = Sanitize::int($numberInput);

// Direct validation
$isValidEmail = Validate::email($emailInput);
$isValidUrl = Validate::url($urlInput);
$isValidString = Validate::string($stringInput);
$isValidInt = Validate::int($intInput);

// Combine sanitization and validation
$email = Sanitize::email($input);
if (Validate::email($email)) {
    // Email is valid and sanitized
}

// In a controller method
public function processInput(): object
{
    $email = $this->request->input('email');

    // Sanitize first
    $email = Sanitize::email($email);

    // Then validate
    if (!Validate::email($email)) {
        return $this->error('Invalid email format', 422);
    }

    // Use sanitized and validated email
    return $this->success(['email' => $email]);
}`
				)
			]),

			// Working with Arrays and Objects
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Validating Arrays and Objects'),
				P({ class: 'text-muted-foreground' },
					`The Validator can work with both arrays and objects, and will update the data
					in place after sanitization.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

// Working with arrays
$data = [
    'name' => '  John Doe  ',
    'email' => 'JOHN@EXAMPLE.COM',
    'age' => '25'
];

$rules = [
    'name' => 'string:100|required',
    'email' => 'email:255|required',
    'age' => 'int:3|required'
];

$validator = new Validator($data, $rules);

if ($validator->isValid()) {
    // $data is now sanitized:
    // $data['name'] = 'John Doe' (trimmed)
    // $data['email'] = 'john@example.com' (sanitized)
    // $data['age'] = 25 (converted to int)
}

// Working with objects
$userData = (object)[
    'name' => '  Jane Smith  ',
    'email' => 'JANE@TEST.COM'
];

$validator = new Validator($userData, [
    'name' => 'string:100|required',
    'email' => 'email:255|required'
]);

if ($validator->isValid()) {
    // $userData properties are now sanitized
    echo $userData->name; // 'Jane Smith'
    echo $userData->email; // 'jane@test.com'
}`
				)
			]),

			// Error Handling
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling'),
				P({ class: 'text-muted-foreground' },
					`The Validator provides multiple ways to access validation errors:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

$data = [
    'email' => 'invalid-email',
    'age' => 'not-a-number'
];

$rules = [
    'name' => 'string:100|required',  // Missing required field
    'email' => 'email:255|required',  // Invalid email
    'age' => 'int:3'                  // Invalid integer
];

$validator = new Validator($data, $rules);

// Check if validation passed
if (!$validator->isValid()) {

    // Get array of all error messages
    $errors = $validator->getErrors();
    // Returns: [
    //   'The key name is not set.',
    //   'The value email is not correct.',
    //   'The value age is not correct.'
    // ]

    // Get concatenated error string
    $message = $validator->getMessage();
    // Returns: 'The key name is not set., The value email is not correct., The value age is not correct.'

    // Return formatted error response
    return $this->error([
        'message' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

// Validation passed, data is sanitized and ready to use
return $this->success($data);`
				)
			]),

			// Integration with Models
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Integration with Models'),
				P({ class: 'text-muted-foreground' },
					`Combine validation with Proto's model system for complete data processing:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Modules\\User\\Models\\User;

class UserController extends ApiController
{
    /**
     * Create user with validation
     */
    public function store(): object
    {
        $input = $this->request->input();

        // Validation rules
        $rules = [
            'firstName' => 'string:100|required',
            'lastName' => 'string:100|required',
            'email' => 'email:255|required',
            'password' => 'string:255|required',
            'bio' => 'string:1000',
            'website' => 'url:255'
        ];

        $validator = Validator::create($input, $rules);

        if (!$validator->isValid()) {
            return $this->error([
                'message' => 'Validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Hash password before saving
        $input['password'] = password_hash($input['password'], PASSWORD_DEFAULT);

        // Create user with validated and sanitized data
        $user = User::create($input);

        return $this->success($user);
    }

    /**
     * Update user with validation
     */
    public function update(): object
    {
        $id = $this->request->params('id');
        $input = $this->request->input();

        $user = User::get($id);
        if (!$user) {
            return $this->error('User not found', 404);
        }

        // Update validation rules (no required fields)
        $rules = [
            'firstName' => 'string:100',
            'lastName' => 'string:100',
            'email' => 'email:255',
            'bio' => 'string:1000',
            'website' => 'url:255'
        ];

        $validator = Validator::create($input, $rules);

        if (!$validator->isValid()) {
            return $this->error([
                'message' => 'Validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Update user with validated data
        $user->set($input);
        $user->update();

        return $this->success($user);
    }
}`
				)
			]),

			// Best Practices
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Validation Best Practices'),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("Always validate user input before processing or storing data"),
					Li("Use appropriate data types in validation rules (string, email, url, int)"),
					Li("Set reasonable length limits to prevent oversized data"),
					Li("Mark required fields explicitly with the |required modifier"),
					Li("Sanitization happens automatically during validation"),
					Li("Check validation results before proceeding with business logic"),
					Li("Provide clear error messages to users"),
					Li("Validate both on creation and updates (with different rules as needed)"),
					Li("Use Proto\\Utils\\Filter\\Sanitize and Validate directly for custom validation"),
					Li("Remember that data is modified in place after sanitization")
				])
			])
		]
	);

export default ValidationPage;

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
					methods from Proto\\Utils\\Filter\\Validate and Proto\\Utils\\Filter\\Sanitize, with special support
					for image file validation.`
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

			// Image Validation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Image File Validation'),
				P({ class: 'text-muted-foreground' },
					`Proto includes comprehensive image validation with support for file size limits, MIME type restrictions,
					and security validation. Use the 'image' type for uploaded files.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Proto\\Http\\UploadFile;

class ImageController extends ApiController
{
    /**
     * Upload and validate images
     */
    public function upload(): object
    {
        // Validation rules for image uploads
        $rules = [
            'profile_image' => 'image:1024|required|mimes:jpeg,png',
            'thumbnail' => 'image:512|mimes:jpeg,jpg,png,gif,webp',
            'gallery_image' => 'image:2048|required|mimes:jpeg,jpg,png,gif',
            'avatar' => 'image:256|required|mimes:png'
        ];

        // Validate uploaded files ($_FILES)
        $validator = Validator::create($_FILES, $rules);

        if (!$validator->isValid()) {
            return $this->error([
                'message' => 'Image validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Process valid images
        $results = [];

        if (isset($_FILES['profile_image'])) {
            $uploadFile = new UploadFile($_FILES['profile_image']);
            $uploadFile->store('local', 'profiles');
            $results['profile_image'] = $uploadFile->getNewName();
        }

        return $this->success($results);
    }

    /**
     * Custom image validation with ImageValidator
     */
    public function customValidation(): object
    {
        use Proto\\Api\\ImageValidator;

        $uploadFile = new UploadFile($_FILES['image']);

        // Custom validation with specific requirements
        $validation = ImageValidator::validate(
            $uploadFile,
            1024, // Max 1MB
            ['image/jpeg', 'image/png'] // Only JPEG and PNG
        );

        if (!$validation['valid']) {
            return $this->error([
                'message' => 'Custom image validation failed',
                'errors' => $validation['errors']
            ], 422);
        }

        return $this->success(['message' => 'Image is valid']);
    }
}`
				),
				P({ class: 'text-muted-foreground mt-4' },
					`Image validation rules format: 'image:maxSizeKB|required|mimes:type1,type2'`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground mt-2' }, [
					Li("image:2048 - Image file with max size of 2048KB (2MB)"),
					Li("required - Field is required (optional)"),
					Li("mimes:jpeg,png,gif - Restrict to specific MIME types (optional)")
				])
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
    // Text and Email
    'name' => 'string:100|required',    // Required string, max 100 chars
    'email' => 'email:255|required',    // Required email, max 255 chars
    'website' => 'url:255',             // Optional URL, max 255 chars
    'phone' => 'string:20',             // Optional string, max 20 chars
    'description' => 'string:1000|required', // Required string, max 1000 chars

    // Numbers and Booleans
    'age' => 'int:3',                   // Optional integer, max 3 digits
    'price' => 'float:10',              // Optional float, max 10 chars
    'active' => 'bool',                 // Boolean value

    // Images
    'image' => 'image:2048|required|mimes:jpeg,jpg,png,gif',
    'avatar' => 'image:512|required|mimes:png',
    'thumbnail' => 'image:256|mimes:jpeg,png,webp'
];

// The validator will:
// 1. Check if required fields are present
// 2. Sanitize the value using the appropriate method (except images)
// 3. Validate the value using the appropriate method
// 4. Check length constraints if specified
// 5. For images: validate size, MIME type, and content`
				)
			]),

			// Image Validation Details
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Image Validation Features'),
				P({ class: 'text-muted-foreground' },
					`Proto's image validation includes comprehensive security and validation checks:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("File upload validation - Ensures proper HTTP POST upload"),
					Li("File size validation - Prevents DoS attacks with size limits"),
					Li("MIME type validation - Checks both reported and actual MIME types"),
					Li("Content validation - Uses getimagesize() to verify image content"),
					Li("Security validation - Multiple layers of file validation")
				]),
				CodeBlock(
`// Supported image formats by default:
$supportedTypes = [
    'jpeg' => 'image/jpeg',
    'jpg' => 'image/jpg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'bmp' => 'image/bmp',
    'tiff' => 'image/tiff'
];

// Example validation rules for different use cases:
$rules = [
    // Profile image: strict requirements
    'profile_image' => 'image:1024|required|mimes:jpeg,png',

    // Gallery images: larger size, more formats
    'gallery_images' => 'image:5120|mimes:jpeg,jpg,png,gif,webp',

    // Avatar: small size, PNG only for transparency
    'avatar' => 'image:256|required|mimes:png',

    // Thumbnail: very small, common formats
    'thumbnail' => 'image:128|mimes:jpeg,png,gif'
];`
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
$isValidImage = Validate::image($_FILES['image']);

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
					in place after sanitization. Note: Images are not sanitized, only validated.`
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

// Working with mixed data (form + files)
$formData = $this->request->input();
$fileData = $_FILES;

$rules = [
    'name' => 'string:100|required',
    'email' => 'email:255|required',
    'profile_image' => 'image:1024|required|mimes:jpeg,png'
];

// Merge form and file data
$allData = array_merge($formData, $fileData);
$validator = new Validator($allData, $rules);

if ($validator->isValid()) {
    // Form data is sanitized, images are validated
    $user = User::create($formData);

    $uploadFile = new UploadFile($_FILES['profile_image']);
    $uploadFile->store('local', 'profiles');
}`
				)
			]),

			// Error Handling
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling'),
				P({ class: 'text-muted-foreground' },
					`The Validator provides multiple ways to access validation errors, including specific image validation errors:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

$data = [
    'email' => 'invalid-email',
    'age' => 'not-a-number'
];

$fileData = [
    'image' => [
        'name' => 'large-file.exe',
        'type' => 'application/octet-stream',
        'size' => 5000000, // 5MB
        'tmp_name' => '/tmp/upload123',
        'error' => 0
    ]
];

$rules = [
    'name' => 'string:100|required',  // Missing required field
    'email' => 'email:255|required',  // Invalid email
    'age' => 'int:3',                 // Invalid integer
    'image' => 'image:1024|required|mimes:jpeg,png' // Invalid image
];

$allData = array_merge($data, $fileData);
$validator = new Validator($allData, $rules);

// Check if validation passed
if (!$validator->isValid()) {

    // Get array of all error messages
    $errors = $validator->getErrors();
    // Returns: [
    //   'The key name is not set.',
    //   'The value email is not correct.',
    //   'The value age is not correct.',
    //   'The image image: File size exceeds maximum allowed size of 1024KB',
    //   'The image image: File type not allowed. Allowed types: jpeg, png'
    // ]

    // Get concatenated error string
    $message = $validator->getMessage();

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
					`Combine validation with Proto's model system for complete data processing, including image uploads:`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Proto\\Http\\UploadFile;
use Modules\\User\\Models\\User;

class UserController extends ApiController
{
    /**
     * Create user with validation including profile image
     */
    public function store(Request $request): object
    {
        $input = $request->all();
        $files = $request->files();

        // Validation rules
        $rules = [
            'firstName' => 'string:100|required',
            'lastName' => 'string:100|required',
            'email' => 'email:255|required',
            'password' => 'string:255|required',
            'bio' => 'string:1000',
            'website' => 'url:255',
            'profile_image' => 'image:1024|required|mimes:jpeg,png',
            'avatar' => 'image:256|mimes:png'
        ];

        $allData = array_merge($input, $files);
        $this->validateRules($allData, $rules);

        // add user
    }

    /**
     * Update user profile with optional image
     */
    public function updateProfile(Request $request): object
    {
        $id = $request->params('id');
        $input = $request->all();
        $files = $request->files();

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
            'website' => 'url:255',
            'profile_image' => 'image:1024|mimes:jpeg,png' // Optional
        ];

        $allData = array_merge($input, $files);
        $this->validateRules($allData, $rules);

        // Update user with validated data
        $user->set($allData);

        // Handle optional image upload
        $uploadFile = $request->file('profile_image');
        if ($uploadFile) {
            $uploadFile->store('local', 'profiles');
            $user->set('profile_image', $uploadFile->getNewName());
        }

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
					Li("Use appropriate data types in validation rules (string, email, url, int, image)"),
					Li("Set reasonable length limits to prevent oversized data"),
					Li("For images, always set size limits to prevent DoS attacks"),
					Li("Specify allowed MIME types for images to restrict file types"),
					Li("Mark required fields explicitly with the |required modifier"),
					Li("Sanitization happens automatically during validation (except for images)"),
					Li("Check validation results before proceeding with business logic"),
					Li("Provide clear error messages to users"),
					Li("Validate both on creation and updates (with different rules as needed)"),
					Li("Use Proto\\Utils\\Filter\\Sanitize and Validate directly for custom validation"),
					Li("Remember that data is modified in place after sanitization"),
					Li("Store uploaded images outside the web root for security"),
					Li("Consider using WebP format for better compression and performance"),
					Li("Always validate both MIME type and actual file content for images")
				])
			])
		]
	);

export default ValidationPage;
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
					for image and file validation via UploadFile objects.`
				)
			]),

			// Basic Validation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Basic Validation with Proto\\Api\\Validator'),
				P({ class: 'text-muted-foreground' },
					`Use Proto's built-in Validator class to validate and sanitize data using rule arrays. The Validator
					works with both arrays and objects, and supports UploadFile objects for file validation.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Proto\\Http\\Router\\Request;

class UserController extends ApiController
{
    /**
     * Create a new user with validation.
     */
    public function create(Request $request): object
    {
        $data = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
            'age' => $request->input('age'),
            'phone' => $request->input('phone'),
            'website' => $request->input('website')
        ];

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
        if (!$validator->isValid())
        {
            return $this->error([
                'message' => 'Validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Data is now validated and sanitized
        $user = User::create((object)$data);
        return $this->success($user);
    }

    /**
     * Using the static create method
     */
    public function update(Request $request): object
    {
        $data = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'bio' => $request->input('bio')
        ];

        $rules = [
            'name' => 'string:100',
            'email' => 'email:255',
            'bio' => 'string:500'
        ];

        // Static method for creating validator
        $validator = Validator::create($data, $rules);

        if (!$validator->isValid())
        {
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
					and security validation. Use the 'image' type for uploaded files. IMPORTANT: Use $request->file()
					to get UploadFile objects instead of accessing $_FILES directly.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Proto\\Http\\Router\\Request;

class ImageController extends ApiController
{
    /**
     * Upload and validate images using Request file methods
     */
    public function upload(Request $request): object
    {
        // Get uploaded files as UploadFile objects
        $data = [
            'profile_image' => $request->file('profile_image'),
            'thumbnail' => $request->file('thumbnail'),
            'gallery_image' => $request->file('gallery_image'),
            'avatar' => $request->file('avatar')
        ];

        // Validation rules for image uploads
        $rules = [
            'profile_image' => 'image:1024|required|mimes:jpeg,png',
            'thumbnail' => 'image:512|mimes:jpeg,jpg,png,gif,webp',
            'gallery_image' => 'image:2048|required|mimes:jpeg,jpg,png,gif',
            'avatar' => 'image:256|required|mimes:png'
        ];

        // Validate uploaded files
        $validator = Validator::create($data, $rules);

        if (!$validator->isValid())
        {
            return $this->error([
                'message' => 'Image validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Process valid images - store using UploadFile methods
        $results = [];

        $profileImage = $data['profile_image'];
        if ($profileImage)
        {
            $profileImage->store('local', 'profiles');
            $results['profile_image'] = $profileImage->getNewName();
        }

        return $this->success($results);
    }

    /**
     * Custom image validation with ImageValidator
     */
    public function customValidation(Request $request): object
    {
        use Proto\\Api\\ImageValidator;

        $uploadFile = $request->file('image');

        if (!$uploadFile)
        {
            return $this->error('No image file provided', 422);
        }

        // Custom validation with specific requirements
        $validation = ImageValidator::validate(
            $uploadFile,
            1024, // Max 1MB
            ['image/jpeg', 'image/png'] // Only JPEG and PNG
        );

        if (!$validation['valid'])
        {
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

			// File Validation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Generic File Validation'),
				P({ class: 'text-muted-foreground' },
					`Proto also supports generic file validation for documents, archives, audio, and video files
					using the 'file' type and FileValidator class.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Controllers\\ApiController;
use Proto\\Api\\Validator;
use Proto\\Api\\FileValidator;
use Proto\\Http\\Router\\Request;

class FileController extends ApiController
{
    /**
     * Upload and validate documents
     */
    public function uploadDocument(Request $request): object
    {
        $data = [
            'document' => $request->file('document'),
            'spreadsheet' => $request->file('spreadsheet')
        ];

        // Validation rules for document uploads
        $rules = [
            'document' => 'file:5120|required|mimes:pdf,doc,docx',
            'spreadsheet' => 'file:2048|mimes:xls,xlsx,csv'
        ];

        $validator = Validator::create($data, $rules);

        if (!$validator->isValid())
        {
            return $this->error([
                'message' => 'File validation failed',
                'errors' => $validator->getErrors()
            ], 422);
        }

        // Store validated files
        $document = $data['document'];
        $document->store('local', 'documents');

        return $this->success([
            'filename' => $document->getNewName()
        ]);
    }

    /**
     * Custom file validation with FileValidator
     */
    public function customFileValidation(Request $request): object
    {
        $uploadFile = $request->file('attachment');

        if (!$uploadFile)
        {
            return $this->error('No file provided', 422);
        }

        // Custom validation with specific requirements
        $validation = FileValidator::validate(
            $uploadFile,
            10240, // Max 10MB
            [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
        );

        if (!$validation['valid'])
        {
            return $this->error([
                'message' => 'File validation failed',
                'errors' => $validation['errors']
            ], 422);
        }

        return $this->success(['message' => 'File is valid']);
    }
}`
				),
				P({ class: 'text-muted-foreground mt-4' },
					`Supported file types for the 'file' validator:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground mt-2' }, [
					Li("Documents: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv"),
					Li("Images: jpeg, jpg, png, gif, webp, bmp"),
					Li("Archives: zip, rar, 7z, tar, gz"),
					Li("Audio: mp3, wav, ogg"),
					Li("Video: mp4, mpeg, mov, avi")
				])
			]),

			// Validation Rules
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Available Validation Rules'),
				P({ class: 'text-muted-foreground' },
					`Proto validation rules follow the pattern 'type:maxLength|required'. The validation
					system uses Proto\\Utils\\Filter\\Validate for validation and Proto\\Utils\\Filter\\Sanitize
					for sanitization. Files and images are NOT sanitized, only validated.`
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

    // Images (use with $request->file())
    'image' => 'image:2048|required|mimes:jpeg,jpg,png,gif',
    'avatar' => 'image:512|required|mimes:png',
    'thumbnail' => 'image:256|mimes:jpeg,png,webp',

    // Files (use with $request->file())
    'document' => 'file:5120|required|mimes:pdf,doc,docx',
    'spreadsheet' => 'file:2048|mimes:xls,xlsx,csv',
    'attachment' => 'file:10240|mimes:pdf,doc,docx,zip'
];

// The validator will:
// 1. Check if required fields are present
// 2. Sanitize the value using the appropriate method (NOT for images/files)
// 3. Validate the value using the appropriate method
// 4. Check length constraints if specified
// 5. For images: validate size, MIME type, and actual image content
// 6. For files: validate size, MIME type, and content matches declared type`
				)
			]),

			// Image Validation Details
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Image & File Validation Features'),
				P({ class: 'text-muted-foreground' },
					`Proto's image and file validation includes comprehensive security and validation checks:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li("UploadFile support - Works with $request->file() for proper file handling"),
					Li("File upload validation - Ensures proper HTTP POST upload"),
					Li("File size validation - Prevents DoS attacks with size limits"),
					Li("MIME type validation - Checks both reported and actual MIME types using finfo"),
					Li("Content validation - For images: uses getimagesize() to verify image content"),
					Li("Security validation - Multiple layers of file validation including content matching")
				]),
				CodeBlock(
`// Supported image formats (ImageValidator defaults):
$imageMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
];

// Supported file formats (FileValidator defaults):
$fileMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Audio/Video
    'audio/mpeg', 'audio/wav',
    'video/mp4', 'video/mpeg'
];

// Example validation rules for different use cases:
$rules = [
    // Profile image: strict requirements
    'profile_image' => 'image:1024|required|mimes:jpeg,png',

    // Gallery images: larger size, more formats
    'gallery_images' => 'image:5120|mimes:jpeg,jpg,png,gif,webp',

    // Avatar: small size, PNG only for transparency
    'avatar' => 'image:256|required|mimes:png',

    // Document upload: common document types
    'resume' => 'file:2048|required|mimes:pdf,doc,docx',

    // Spreadsheet: Excel and CSV
    'data_file' => 'file:5120|mimes:xls,xlsx,csv',

    // Archive: compressed files
    'backup' => 'file:10240|mimes:zip,tar,gz'
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
					in place after sanitization. Note: Images and files are NOT sanitized, only validated.
					Always use $request->file() for file uploads instead of $_FILES directly.`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Api\\Validator;
use Proto\\Http\\Router\\Request;

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

if ($validator->isValid())
{
    // $data is now sanitized:
    // $data['name'] = 'John Doe' (trimmed)
    // $data['email'] = 'john@example.com' (sanitized)
    // $data['age'] = 25 (converted to int)
}

// Working with mixed data (form + files) in a controller
public function store(Request $request): object
{
    // Build data array with form inputs and file uploads
    $data = [
        'name' => $request->input('name'),
        'email' => $request->input('email'),
        'profile_image' => $request->file('profile_image') // UploadFile object
    ];

    $rules = [
        'name' => 'string:100|required',
        'email' => 'email:255|required',
        'profile_image' => 'image:1024|required|mimes:jpeg,png'
    ];

    $validator = Validator::create($data, $rules);

    if ($validator->isValid())
    {
        // Form data is sanitized, images are validated
        $user = new User((object)[
            'name' => $data['name'],
            'email' => $data['email']
        ]);
        $user->add();

        // Store the validated image
        $profileImage = $data['profile_image'];
        $profileImage->store('local', 'profiles');
        $user->profileImage = $profileImage->getNewName();
        $user->update();

        return $this->success($user);
    }

    return $this->error($validator->getErrors(), 422);
}`
				)
			]),

			// Error Handling
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Error Handling'),
				P({ class: 'text-muted-foreground' },
					`The Validator provides multiple ways to access validation errors, including specific image and file validation errors:`
				),
				CodeBlock(
`<?php declare(strict_types=1);

use Proto\\Api\\Validator;
use Proto\\Http\\Router\\Request;

public function upload(Request $request): object
{
    $data = [
        'email' => 'invalid-email',
        'age' => 'not-a-number',
        'image' => $request->file('image') // Could be invalid file
    ];

    $rules = [
        'name' => 'string:100|required',  // Missing required field
        'email' => 'email:255|required',  // Invalid email
        'age' => 'int:3',                 // Invalid integer
        'image' => 'image:1024|required|mimes:jpeg,png' // Invalid image
    ];

    $validator = new Validator($data, $rules);

    // Check if validation passed
    if (!$validator->isValid())
    {
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
    return $this->success($data);
}`
				)
			]),

			// Integration with Models
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Integration with Models'),
				P({ class: 'text-muted-foreground' },
					`Combine validation with Proto's model system for complete data processing, including image uploads.
					Use the controller's validateRules() method for cleaner integration.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\User\\Controllers;

use Proto\\Controllers\\ApiController;
use Proto\\Http\\Router\\Request;
use Modules\\User\\Models\\User;

class UserController extends ApiController
{
    /**
     * Create user with validation including profile image
     */
    public function store(Request $request): object
    {
        // Build data array with inputs and files
        $data = [
            'firstName' => $request->input('firstName'),
            'lastName' => $request->input('lastName'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
            'bio' => $request->input('bio'),
            'website' => $request->input('website'),
            'profile_image' => $request->file('profile_image'),
            'avatar' => $request->file('avatar')
        ];

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

        // Use controller's validateRules method
        $this->validateRules($data, $rules);

        // Create user with validated data
        $user = new User((object)[
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'bio' => $data['bio'] ?? null,
            'website' => $data['website'] ?? null
        ]);
        $user->add();

        // Handle image uploads
        $profileImage = $data['profile_image'];
        if ($profileImage)
        {
            $profileImage->store('local', 'profiles');
            $user->profileImage = $profileImage->getNewName();
            $user->update();
        }

        return $this->success($user);
    }

    /**
     * Update user profile with optional image
     */
    public function updateProfile(Request $request): object
    {
        $params = $request->params();
        $id = (int)($params->id ?? 0);

        $user = User::get($id);
        if (!$user)
        {
            return $this->error('User not found', 404);
        }

        // Build data for optional updates
        $data = [
            'firstName' => $request->input('firstName'),
            'lastName' => $request->input('lastName'),
            'email' => $request->input('email'),
            'bio' => $request->input('bio'),
            'website' => $request->input('website'),
            'profile_image' => $request->file('profile_image') // Optional
        ];

        // Update validation rules (no required fields)
        $rules = [
            'firstName' => 'string:100',
            'lastName' => 'string:100',
            'email' => 'email:255',
            'bio' => 'string:1000',
            'website' => 'url:255',
            'profile_image' => 'image:1024|mimes:jpeg,png' // Optional
        ];

        $this->validateRules($data, $rules);

        // Update user fields that were provided
        if ($data['firstName']) $user->firstName = $data['firstName'];
        if ($data['lastName']) $user->lastName = $data['lastName'];
        if ($data['email']) $user->email = $data['email'];
        if ($data['bio']) $user->bio = $data['bio'];
        if ($data['website']) $user->website = $data['website'];

        // Handle optional image upload
        $profileImage = $data['profile_image'];
        if ($profileImage)
        {
            $profileImage->store('local', 'profiles');
            $user->profileImage = $profileImage->getNewName();
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
					Li("Use $request->file() to get UploadFile objects, NOT $_FILES directly"),
					Li("Use $request->fileArray() for multiple file uploads"),
					Li("Use appropriate data types in validation rules (string, email, url, int, image, file)"),
					Li("Set reasonable length limits to prevent oversized data"),
					Li("For images and files, always set size limits to prevent DoS attacks"),
					Li("Specify allowed MIME types for images/files to restrict file types"),
					Li("Mark required fields explicitly with the |required modifier"),
					Li("Sanitization happens automatically during validation (except for images and files)"),
					Li("Check validation results before proceeding with business logic"),
					Li("Provide clear error messages to users"),
					Li("Validate both on creation and updates (with different rules as needed)"),
					Li("Use Proto\\Utils\\Filter\\Sanitize and Validate directly for custom validation"),
					Li("Remember that data is modified in place after sanitization"),
					Li("Store uploaded files outside the web root for security"),
					Li("Consider using WebP format for better compression and performance"),
					Li("Always validate both MIME type and actual file content for security"),
					Li("Use the 'file' type for documents, archives, and media files"),
					Li("Use the 'image' type specifically for image uploads with content validation")
				])
			])
		]
	);

export default ValidationPage;
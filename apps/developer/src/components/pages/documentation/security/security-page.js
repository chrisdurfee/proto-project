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
			]),

			// Auth Policies
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Auth Policies'),
				P({ class: 'text-muted-foreground' },
					`Policies handle authorization for controller actions. Every ResourceController should have a
					\`$policy\` property pointing to a policy class. The policy determines whether the current user
					is allowed to perform each action (get, add, update, delete, all, etc.).`
				),
				P({ class: 'text-muted-foreground' },
					`Module policies extend the Common policy which provides a \`$type\` property
					for dispatch and several built-in helper methods.`
				),
				CodeBlock(
`<?php declare(strict_types=1);
namespace Modules\\Event\\Auth\\Policies;

use Common\\Auth\\Policies\\Policy;
use Modules\\Event\\Models\\Event;
use Proto\\Http\\Router\\Request;

class EventPolicy extends Policy
{
	/**
	 * The type of the policy.
	 *
	 * @var string|null
	 */
	protected ?string $type = 'event';

	/**
	 * Runs before all methods — return true to allow immediately.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function before(Request $request): bool
	{
		return auth()->user->isAdmin();
	}

	/**
	 * Default fallback if no per-action method exists.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function default(Request $request): bool
	{
		return false;
	}

	/**
	 * Check if user can view a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function get(Request $request): bool
	{
		return $this->ownsResource($request, Event::class);
	}

	/**
	 * Check if user can create a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function add(Request $request): bool
	{
		return $this->isSignedIn();
	}

	/**
	 * Check if user can update a resource.
	 *
	 * @param Request $request
	 * @return bool
	 */
	public function update(Request $request): bool
	{
		return $this->ownsResource($request, Event::class);
	}
}`
				),
				P({ class: 'text-muted-foreground' },
					`Apply a policy to a controller with the \`$policy\` property:`
				),
				CodeBlock(
`class EventController extends ResourceController
{
	protected ?string $policy = EventPolicy::class;

	public function __construct(protected ?string $model = Event::class)
	{
		parent::__construct();
	}
}`
				)
			]),

			// Policy Helpers
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Built-in Policy Helpers'),
				P({ class: 'text-muted-foreground' },
					`The Common policy base class provides several convenience methods to reduce boilerplate
					in your policy classes:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('$this->isSignedIn() — checks if a user is logged in via session'),
					Li('$this->getUserId() — returns session()->user->id or null'),
					Li('$this->getResourceId(Request $request) — extracts the resource ID from the request'),
					Li('$this->ownsResource(Request $request, string $modelClass) — fetches the resource by ID and compares its userId to the session user'),
					Li('$this->matchesRouteUser(Request $request, string $paramName) — checks if a route parameter matches the session user ID')
				]),
				CodeBlock(
`// Using built-in helpers
public function get(Request $request): bool
{
	return $this->ownsResource($request, Event::class);
}

public function add(Request $request): bool
{
	return $this->isSignedIn();
}

public function update(Request $request): bool
{
	return $this->matchesRouteUser($request, 'userId');
}`
				)
			]),

			// Policy Type and Validation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Policy Type & Validation'),
				P({ class: 'text-muted-foreground' },
					`Every policy should set a \`$type\` property (e.g., 'event', 'post', 'group'). The Common
					Policy uses \`$type\` for action dispatch. If omitted, Proto auto-detects \`$type\` from
					the class name (e.g., EventPolicy → 'event'), but setting it explicitly is recommended.`
				),
				P({ class: 'text-muted-foreground' },
					`Proto validates policy method signatures in all environments. It warns if a
					policy method doesn't accept \`(Request $request): bool\`. In development this triggers
					an E_USER_WARNING; in production it logs via error_log(). This catches common mistakes
					like missing the Request parameter.`
				),
				P({ class: 'text-muted-foreground font-semibold' },
					`Key rules: Use \`add()\` not \`create()\` for POST dispatch. Every method must accept
					\`(Request $request): bool\`. Always extend \`Common\\Auth\\Policies\\Policy\`, not the
					Proto base directly.`
				)
			])
		]
	);

export default SecurityPage;

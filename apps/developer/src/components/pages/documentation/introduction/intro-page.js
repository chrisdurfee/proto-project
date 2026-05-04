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
			class: `flex p-4 max-h-[650px] max-w-[1024px] overflow-x-auto rounded-lg border bg-muted whitespace-break-spaces break-all cursor-pointer mt-4 ${props.class}`
		},
		[
			Code(
				{
					class: 'font-mono flex-auto text-sm',
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
 * IntroPage
 *
 * This page introduces the Proto framework by outlining its purpose,
 * features, file structure, naming conventions, configuration, bootstrapping,
 * and global data management. It also includes UI examples.
 *
 * @returns {DocPage}
 */
export const IntroPage = () => (
	DocPage(
		{
			title: 'Introduction to Proto',
			description: 'Proto is an open-source modular monolith framework for building scalable server applications quickly and securely.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P({ class: 'text-muted-foreground' },
					`Distributed systems are great except when they are not. Building large team-based systems that can scale has many challenges. Testing, conflicts, build times, response times, developer environments, etc. The Proto framework is created to allow scalable server applications to be created quickly and securely. It's modular to allow teams to build their specific features without many of the issues when building distributed systems. It autoloads and auto bootstraps. Configuration is managed in the Common/Config .env file.`),
			]),

			// Framework Features
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Framework Features'),
				P({ class: 'text-muted-foreground' },
					`Proto includes items for creating complex applications, including:`),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('Modules system to encpasulate features'),
					Li("API Systems with REST Router"),
					Li('Validation'),
					Li('Server Sent Events (SSE)'),
					Li('Websockets & Sockets'),
					Li("HTTP Resources"),
					Li("Security Gates and Policies"),
					Li("Error Tracking and Handling"),
					Li("Authentication using roles and permissions"),
					Li("Controllers"),
					Li("Caching (Redis)"),
					Li("Configs with .env JSON support"),
					Li("Models with complex relationships (eager and lazy)"),
					Li("Collections for data manipulation"),
					Li("Storage Layers to abstract data storage from data sources"),
					Li("Session Management (database and file support)"),
					Li("Services & Service Providers"),
					Li("Events, Event Loops with async support"),
					Li('Jobs with event queues (database, Kafka support)'),
					Li("Design Patterns"),
					Li("HTML Templates using components"),
					Li("Email Rendering with Templates"),
					Li("Dispatching Email, SMS, and Web Push"),
					Li("Resource Generators for quick code scaffolding"),
					Li("Database Abstractions"),
					Li("Database Adapters with MySQLi support"),
					Li("Query Builders"),
					Li("Database Migrations with seeding support"),
					Li("Seeding for testing"),
					Li("Factories for generating test data"),
					Li("Testing with PHPUnit, data faking, and robust utilities"),
					Li("Automations to create routine tasks"),
					Li("File Storage (Local, S3)"),
					Li("Integrations to third-party services (REST, JWT, Oauth2 support)"),
					Li("Utilities for dates, strings, files, encryption, and more")
				])
			]),

			// File Structure
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'File Structure'),
				P(
					{ class: 'text-muted-foreground' },
					`A typical Proto application is structured as follows:`
				),
				CodeBlock(
`common/         // The root for your application code and shared components between modules.
modules/        // Contains self-contained modules for each major domain or feature.
public/         // Front-end assets and public resources.
apps/           // the front end applications

vendor/protoframework/proto/src/          // The core framework. This folder is accessible but should not be modified.`
				)
			]),

			// Naming Conventions & Namespace Structure
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Naming Conventions & Namespace Structure'),
				P({ class: 'text-muted-foreground' },
					`All class names should be in PascalCase, and all methods and variables should be in camelCase.
					Class names should be singular, while namespace paths can be plural.`),
				P({ class: 'text-muted-foreground' },
					`Folder names should be pascal case. Files should use PascalCase.
					Namespaces should reflect the folder structure to support autoloading.`)
			]),

			// Configuration
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Configuration'),
				P({ class: 'text-muted-foreground' },
					`Before beginning, configure your application settings in the Common/Config .env file.
					All settings should be registered as JSON.`),
				P({ class: 'text-muted-foreground' },
					`The Proto\\Config class loads your settings during bootstrap.
					It is a singleton; use Proto\\Config::getInstance() to access configurations.`),
				CodeBlock(
					`// The "Config" class can be accessed using a global function:
// get value
$value = env('settingName');

// set value
setEnv('settingName', $value);
`
				)
			]),

			// Bootstrapping
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Bootstrapping'),
				P({ class: 'text-muted-foreground' },
					`Proto auto bootstraps when interfacing with an API, Controller, Model, Storage, or Routine.
					Simply include /vendor/autoload.php and call the namespaced classes you need.`)
			]),

			// Global Data
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Global Data'),
				P({ class: 'text-muted-foreground' },
					`Proto implements a global data pattern. Use Common\\Data to get and set global data.
					This Data class is a singleton that uses getters and setters.`)
			])
		]
	)
);

export default IntroPage;
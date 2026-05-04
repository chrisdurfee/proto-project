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
 * ServicesPage
 *
 * This page explains how Proto's services work. Services are self-contained classes that are registered
 * in your configuration (.env file under "services") and loaded right after the application bootstraps.
 * They can listen for storage layer actions and perform activation tasks.
 *
 * @returns {DocPage}
 */
export const ServicesPage = () =>
	DocPage(
		{
			title: 'Service Providers',
			description: 'Learn how to create, register, and activate service providers in Proto.'
		},
		[
			// Overview
			Section({ class: 'flex flex-col gap-y-4' }, [
				H4({ class: 'text-lg font-bold' }, 'Overview'),
				P(
					{ class: 'text-muted-foreground' },
					`Service providers in Proto are self-contained and provide additional functionality that is loaded immediately after the framework boots.
					They are registered in your configuration file (typically within common/Config) under the "services" key, for example:`
				),
				CodeBlock(
`"services": [
    "Example\\ExampleService",
    "Example\\Parent\\ProductionService"
]`
				),
				P(
					{ class: 'text-muted-foreground' },
					`Once registered, service providers can listen for events, especially from the storage layer, and set up any global functionality your application needs.`
				)
			]),

			// Naming Conventions
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Naming'),
				P(
					{ class: 'text-muted-foreground' },
					`The name of a service should always be singular and followed by "Service". For example:`
				),
				CodeBlock(
`<?php
namespace Common\\Services\\Providers;

use Proto\\Providers\\ServiceProvider as Service;

class ExampleService extends Service
{
    protected function addEvents()
    {
        // Register events here
    }

    public function activate()
    {
        // Perform actions on framework activation
    }
}`
				)
			]),

			// Activation
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Activation'),
				P(
					{ class: 'text-muted-foreground' },
					`Service providers are activated when the framework boots. This allows service providers to register any actions or listeners they need to be available
					immediately as the application starts. For example:`
				),
				CodeBlock(
`// In a service class
public function activate()
{
    // Perform setup tasks, such as initializing components or registering listeners.
}`
				)
			]),

			// Events
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Events'),
				P(
					{ class: 'text-muted-foreground' },
					`Service providers can also register events to respond to various actions, such as storage events.
					Within your service, use the inherited event method to set up event listeners. For example:`
				),
				CodeBlock(
`// In a service class
protected function addEvents()
{
    $this->event('Ticket:add', function($ticket) {
        // Handle the event when a ticket is added.
    });
}`
				)
			]),

			// ServiceResult
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'ServiceResult'),
				P(
					{ class: 'text-muted-foreground' },
					`Proto provides a \`ServiceResult\` value object to standardize return values from service methods.
					This eliminates ambiguity between returning \`false\`, \`null\`, or error objects. Controllers consistently
					check \`$result->success\` and access \`$result->data\` or \`$result->error\`.`
				),
				CodeBlock(
`use Proto\\Services\\ServiceResult;

// In a service method — success
public function createGroup(int $userId, int $communityId, array $data): ServiceResult
{
	if (!$this->isGroupSlugUnique($communityId, $data['slug']))
	{
		return ServiceResult::failure('Group slug already exists');
	}

	$group = $this->createGroupRecord($userId, $communityId, $data);
	if (!$group)
	{
		return ServiceResult::failure('Failed to create group', 'CREATE_FAILED');
	}

	return ServiceResult::success($group);
}`
				),
				P(
					{ class: 'text-muted-foreground' },
					`In a controller, check the result and respond accordingly:`
				),
				CodeBlock(
`public function create(Request $request): object
{
	$result = $this->service->createGroup($userId, $communityId, $data);
	if (!$result->success)
	{
		return $this->error($result->error);
	}

	return $this->response($result->data);
}`
				),
				P(
					{ class: 'text-muted-foreground font-semibold' },
					`API:`
				),
				Ul({ class: 'list-disc pl-6 flex flex-col gap-y-1 text-muted-foreground' }, [
					Li('ServiceResult::success(mixed $data = null) — creates a successful result'),
					Li('ServiceResult::failure(string $message, ?string $code = null) — creates a failure result'),
					Li('$result->success (bool) — whether the operation succeeded'),
					Li('$result->data (mixed) — the result data on success, null on failure'),
					Li('$result->error (?string) — the error message on failure'),
					Li('$result->code (?string) — optional error code for programmatic handling'),
					Li('$result->failed() (bool) — convenience method, inverse of $result->success')
				])
			]),

			// Built-in Service Traits
			Section({ class: 'flex flex-col gap-y-4 mt-12' }, [
				H4({ class: 'text-lg font-bold' }, 'Built-in Service Traits'),
				P(
					{ class: 'text-muted-foreground' },
					`Proto provides reusable traits for common service patterns. Use these instead of duplicating logic across services.`
				),
				P({ class: 'text-muted-foreground font-semibold' }, 'ToggleLikeTrait'),
				P(
					{ class: 'text-muted-foreground' },
					`Standardizes like/toggle with atomic counters. Handles: check existing → remove + decrement / add + increment → return status.`
				),
				CodeBlock(
`use Proto\\Services\\Traits\\ToggleLikeTrait;

class PostMainService extends Service
{
	use ToggleLikeTrait;

	public function togglePostLike(int $userId, int $postId): object
	{
		return $this->toggleLike(
			PostLike::class,
			Post::class,
			$userId,
			$postId,
			'postId',
			'likeCount'
		);
		// Returns: {liked: bool, likeCount: int}
	}
}`
				),
				P({ class: 'text-muted-foreground font-semibold mt-4' }, 'TogglePivotTrait'),
				P(
					{ class: 'text-muted-foreground' },
					`Generic pivot toggle for bookmarks, favorites, follows. If pivot exists → delete; if not → create.`
				),
				CodeBlock(
`use Proto\\Services\\Traits\\TogglePivotTrait;

class BookmarkService extends Service
{
	use TogglePivotTrait;

	public function toggle(int $userId, string $itemType, int $itemId): object
	{
		return $this->togglePivot(Bookmark::class, [
			'userId' => $userId,
			'itemType' => $itemType,
			'itemId' => $itemId
		]);
		// Returns: {active: bool, record: ?object}
	}
}`
				),
				P({ class: 'text-muted-foreground font-semibold mt-4' }, 'VoteableTrait'),
				P(
					{ class: 'text-muted-foreground' },
					`Up/down voting with toggle-off, vote-switching, and atomic score updates. Handles same-vote toggle off, opposite-vote switch (2× swing), and new vote creation.`
				),
				CodeBlock(
`use Proto\\Services\\Traits\\VoteableTrait;

class ForumService extends Service
{
	use VoteableTrait;

	public function voteOnPost(int $userId, int $postId, string $direction): object
	{
		return $this->vote(
			ForumPostVote::class,
			ForumPost::class,
			$userId,
			$postId,
			'postId',
			$direction, // 'up' or 'down'
			'score'
		);
		// Returns: {direction: ?string, score: int}
	}
}`
				),
				P({ class: 'text-muted-foreground font-semibold mt-4' }, 'AudienceTargetingTrait'),
				P(
					{ class: 'text-muted-foreground' },
					`Multi-dimensional targeting (brands, vehicle types, interests, etc.). Services implement getTargetingConfig() and get reusable getTargeting() and saveTargets() methods.`
				),
				CodeBlock(
`use Proto\\Services\\Traits\\AudienceTargetingTrait;

class EventAudienceService extends Service
{
	use AudienceTargetingTrait;

	protected function getTargetingConfig(): array
	{
		return [
			'brands' => ['model' => EventBrandTarget::class, 'fk' => 'eventId'],
			'vehicleTypes' => ['model' => EventVehicleTypeTarget::class, 'fk' => 'eventId'],
			'interests' => ['model' => EventInterestTarget::class, 'fk' => 'eventId', 'valueField' => 'interestId'],
		];
	}
}

// Usage:
$service->getTargeting($eventId);          // Returns object with all dimensions
$service->saveTargets($eventId, $targets); // Delete-then-insert for each dimension`
				)
			])
		]
	);

export default ServicesPage;
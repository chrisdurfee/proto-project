<?php declare(strict_types=1);

namespace Modules\Tracking\Signals\Signals;

/**
 * SignalType
 *
 * Canonical domain event signal type constants.
 *
 * @package Modules\Tracking\Signals\Signals
 */
class SignalType
{
	/**
	 * User started the onboarding flow.
	 *
	 * @var string
	 */
	public const ONBOARDING_STARTED = 'onboarding.started';

	/**
	 * User completed a single onboarding step.
	 * Metadata: { stepKey: string, stepData: object }
	 *
	 * @var string
	 */
	public const ONBOARDING_STEP_COMPLETED = 'onboarding.step_completed';

	/**
	 * User completed the full onboarding flow.
	 *
	 * @var string
	 */
	public const ONBOARDING_COMPLETED = 'onboarding.completed';

	/**
	 * User abandoned the onboarding flow.
	 *
	 * @var string
	 */
	public const ONBOARDING_ABANDONED = 'onboarding.abandoned';

	/**
	 * User updated their preferences.
	 * Metadata: { preferenceType: string }
	 *
	 * @var string
	 */
	public const PREFERENCE_UPDATED = 'preference.updated';

	/**
	 * User added a vehicle to their garage.
	 * Metadata: { vehicleId: int }
	 *
	 * @var string
	 */
	public const GARAGE_VEHICLE_ADDED = 'garage.vehicle_added';

	/**
	 * User added a wanted vehicle.
	 * Metadata: { wantedId: int }
	 *
	 * @var string
	 */
	public const GARAGE_WANTED_ADDED = 'garage.wanted_added';

	/**
	 * User created a post.
	 * Metadata: { postId: int }
	 *
	 * @var string
	 */
	public const POST_CREATED = 'post.created';

	/**
	 * User created a comment.
	 * Metadata: { commentId: int }
	 *
	 * @var string
	 */
	public const COMMENT_CREATED = 'comment.created';

	/**
	 * User created a forum reply.
	 * Metadata: { replyId: int }
	 *
	 * @var string
	 */
	public const FORUM_REPLY_CREATED = 'forum.reply_created';

	/**
	 * User joined a group.
	 * Metadata: { groupId: int }
	 *
	 * @var string
	 */
	public const GROUP_JOINED = 'group.joined';

	/**
	 * User followed another user.
	 * Metadata: { targetUserId: int }
	 *
	 * @var string
	 */
	public const USER_FOLLOWED = 'user.followed';

	/**
	 * User joined an event.
	 * Metadata: { eventId: int }
	 *
	 * @var string
	 */
	public const EVENT_JOINED = 'event.joined';

	/**
	 * User booked a track day.
	 * Metadata: { bookingId: int }
	 *
	 * @var string
	 */
	public const TRACK_BOOKED = 'track.booked';

	/**
	 * User completed a drive.
	 * Metadata: { driveId: int }
	 *
	 * @var string
	 */
	public const DRIVE_COMPLETED = 'drive.completed';

	/**
	 * User logged drive miles.
	 * Metadata: { value: float } — miles driven on this trip
	 *
	 * @var string
	 */
	public const DRIVE_MILES = 'drive.miles';

	/**
	 * User hit 150 mph on a track.
	 * Metadata: { trackId: int, speed: float }
	 *
	 * @var string
	 */
	public const TRACK_SPEED_150MPH = 'track.speed_150mph';

	/**
	 * User's post received a like.
	 * Metadata: { postId: int, likedBy: int }
	 *
	 * @var string
	 */
	public const POST_LIKED = 'post.liked';

	/**
	 * User replied to a post comment.
	 * Metadata: { commentId: int, parentId: int, postId: int }
	 *
	 * @var string
	 */
	public const COMMENT_REPLY_CREATED = 'comment.reply_created';

	/**
	 * User liked a post comment.
	 * Metadata: { commentId: int }
	 *
	 * @var string
	 */
	public const COMMENT_LIKED = 'comment.liked';

	/**
	 * User shared a media item.
	 * Metadata: { mediaId: int, mediaType: string, shareType: string }
	 *
	 * @var string
	 */
	public const MEDIA_SHARED = 'media.shared';

	/**
	 * User logged a vehicle service record.
	 * Metadata: { vehicleId: int, serviceLogId: int }
	 *
	 * @var string
	 */
	public const SERVICE_LOGGED = 'service.logged';

	/**
	 * User replied to a marketplace listing.
	 * Metadata: { listingId: int, commentId: int }
	 *
	 * @var string
	 */
	public const MARKETPLACE_COMMENT_CREATED = 'marketplace.comment_created';

	/**
	 * User shared a post.
	 * Metadata: { postId: int, shareType: string }
	 *
	 * @var string
	 */
	public const POST_SHARED = 'post.shared';

	/**
	 * User created a forum post.
	 * Metadata: { postId: int, forumId: int }
	 *
	 * @var string
	 */
	public const FORUM_POST_CREATED = 'forum.post_created';

	/**
	 * User voted on a forum post.
	 * Metadata: { postId: int, direction: string }
	 *
	 * @var string
	 */
	public const FORUM_POST_VOTED = 'forum.post_voted';

	/**
	 * User sent a message.
	 * Metadata: { messageId: int, conversationId: int }
	 *
	 * @var string
	 */
	public const MESSAGE_SENT = 'message.sent';

	/**
	 * User favorited a vehicle (added to watch list).
	 * Metadata: { vehicleId: int }
	 *
	 * @var string
	 */
	public const VEHICLE_FAVORITED = 'vehicle.favorited';
}

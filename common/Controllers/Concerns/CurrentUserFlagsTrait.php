<?php declare(strict_types=1);
namespace Common\Controllers\Concerns;

use Proto\Controllers\Traits\BatchEnrichmentTrait;

/**
 * CurrentUserFlagsTrait
 *
 * Standardized batch-enrichment for "did the current user X this row?"
 * questions (liked, bookmarked, saved, favorited, following, etc).
 *
 * Goals:
 *  - One canonical place to declare which flags a controller emits.
 *  - One canonical field name per concept across modules, so drift like
 *    one endpoint emitting `liked` for bookmarks and another emitting
 *    `liked` for likes never creeps in.
 *  - Reuses {@see BatchEnrichmentTrait::batchMapExists()} under the
 *    hood, so there is no new query infrastructure.
 *
 * Usage on a ResourceController:
 *
 *   use Common\Controllers\Concerns\CurrentUserFlagsTrait;
 *
 *   class PostController extends ResourceController
 *   {
 *       use CurrentUserFlagsTrait;
 *
 *       protected array $currentUserFlags = [
 *           'isBookmarked' => [
 *               'model' => \Modules\Bookmark\Models\Bookmark::class,
 *               'foreignKey' => 'itemId',
 *               'extraFilter' => [['itemType', 'post']],
 *           ],
 *           'isLiked' => [
 *               'model' => \Modules\Post\Models\PostLike::class,
 *               'foreignKey' => 'postId',
 *           ],
 *       ];
 *
 *       protected function enrichRows(array &$rows, Request $request): void
 *       {
 *           $userId = session()->user->id ?? null;
 *           $this->enrichCurrentUserFlags($rows, $userId ? (int)$userId : null);
 *       }
 *   }
 *
 * Each entry in `$currentUserFlags` is keyed by the field name that
 * will be set on the row, and accepts:
 *
 *  - `model`        (string, required) Fully-qualified Model class.
 *  - `foreignKey`   (string, required) Column on the related model
 *                                      that points back at row id.
 *  - `userField`    (string, optional) Column on the related model
 *                                      holding the user id. Default `userId`.
 *  - `extraFilter`  (array,  optional) Extra filter rows passed to
 *                                      `fetchWhere()`-style filters.
 *  - `sourceKey`    (string, optional) Column on the row to match
 *                                      against. Default `id`.
 *
 * If the user is not signed in, all declared flag fields are still
 * set to `false` so frontend code never has to null-check them.
 *
 * @package Common\Controllers\Concerns
 */
trait CurrentUserFlagsTrait
{
	use BatchEnrichmentTrait;

	/**
	 * Apply every declared flag to the supplied rows.
	 *
	 * Safe to call when `$rows` is empty or `$userId` is null —
	 * in those cases every declared field is set to false on each
	 * row so the response shape is stable.
	 *
	 * @param array $rows
	 * @param int|null $userId
	 * @return void
	 */
	protected function enrichCurrentUserFlags(array &$rows, ?int $userId): void
	{
		if (empty($this->currentUserFlags) || empty($rows))
		{
			return;
		}

		if ($userId === null || $userId <= 0)
		{
			foreach ($this->currentUserFlags as $field => $_)
			{
				foreach ($rows as &$row)
				{
					$row->$field = false;
				}
				unset($row);
			}
			return;
		}

		foreach ($this->currentUserFlags as $field => $config)
		{
			$model = $config['model'] ?? null;
			$foreignKey = $config['foreignKey'] ?? null;
			if ($model === null || $foreignKey === null)
			{
				continue;
			}

			$userField = $config['userField'] ?? 'userId';
			$sourceKey = $config['sourceKey'] ?? 'id';
			$extraFilter = $config['extraFilter'] ?? [];

			$filter = array_merge(
				[[$userField, $userId]],
				$extraFilter
			);

			$this->batchMapExists(
				$rows,
				$model,
				$foreignKey,
				$field,
				$filter,
				$sourceKey
			);
		}
	}
}

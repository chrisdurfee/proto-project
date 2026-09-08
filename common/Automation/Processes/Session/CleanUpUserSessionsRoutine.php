<?php declare(strict_types=1);

namespace Common\Automation\Processes\Session;

use Proto\Automation\Processes\Routine;
use Proto\Http\Session\Models\UserSession;

/**
 * CleanUpUserSessionsRoutine
 *
 * App-level replacement for the framework's
 * Proto\Automation\Processes\Session\CleanUpSessionRoutine, which has two
 * bugs that make every run fail before it purges anything:
 *
 *   1. It calls UserSession::getExpiredSessions() / getEmptySessions()
 *      with static call syntax, but both are instance methods on the
 *      model (they read $this->storage) — PHP throws "Non-static method
 *      ... cannot be called statically" on the very first line of
 *      process(), so the routine has never completed a single run.
 *   2. Even with that fixed, it iterates the returned rows as if they
 *      were bare session ID strings and re-wraps them —
 *      `UserSession::remove((object)['id' => $row])` — but
 *      getExpiredSessions()/getEmptySessions() return row *objects*
 *      (`select('id')->fetch()`), so `$row` is `{id: '...'}`, not a
 *      scalar. The nested wrap would target a garbage `id` value and
 *      delete nothing.
 *
 * Since this cron was also never scheduled (see
 * infrastructure/docker/cron/session-cleanup), the `user_sessions` table
 * — the framework's database-backed session store — has accumulated
 * expired and empty rows unbounded since launch. This routine performs
 * the sweep the vendor routine intends, calling the model correctly, and
 * is what the cron entry now points to instead of the vendor class.
 *
 * @package Common\Automation\Processes\Session
 */
class CleanUpUserSessionsRoutine extends Routine
{
	/**
	 * Performs the routine process.
	 *
	 * @return void
	 */
	protected function process(): void
	{
		$model = new UserSession();

		foreach ($model->getExpiredSessions() as $row)
		{
			UserSession::remove($row->id);
		}

		foreach ($model->getEmptySessions() as $row)
		{
			UserSession::remove($row->id);
		}
	}
}

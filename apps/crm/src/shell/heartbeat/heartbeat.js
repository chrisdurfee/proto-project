import { Comment } from "@base-framework/atoms";
import { PulseTimer } from "./pulse-timer.js";

/**
 * This will set up a timer to check user
 * authentication every 5 minutes.
 */
const FIVE_MINUTES = 5 * 60 * 1000;
const timer = new PulseTimer(FIVE_MINUTES);

/**
 * Heartbeat
 *
 * This class is responsible for managing the heartbeat mechanism
 *
 * It periodically checks if the user is still authenticated and
 * logs them out if their session has expired.
 */
export const Heartbeat = () => (
    Comment({
        textContent: 'Heartbeat',
        onCreated()
        {
            timer.start();
        },
        onDestroy()
        {
            timer.stop();
        }
    })
);
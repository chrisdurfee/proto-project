import { MessageModel } from "./message-model.js";

/**
 * MessageReadTracker
 *
 * Tracks message visibility using Intersection Observer and marks messages as read.
 * Debounces API calls to avoid excessive requests.
 */
export class MessageReadTracker
{
	/**
	 * @param {number} conversationId - The conversation ID
	 * @param {object} options - Configuration options
	 */
	constructor(conversationId, options = {})
	{
		this.conversationId = conversationId;
		this.lastReadMessageId = null;
		this.readTimeout = null;
		this.observer = null;

		// Configure intersection observer options
		this.observerOptions = {
			root: options.root || null, // viewport
			rootMargin: options.rootMargin || '0px',
			threshold: options.threshold || 0.5 // 50% visible
		};

		// Debounce delay in milliseconds
		this.debounceDelay = options.debounceDelay || 1000;

		this.setupObserver();
	}

	/**
	 * Set up the Intersection Observer.
	 *
	 * @private
	 * @returns {void}
	 */
	setupObserver()
	{
		this.observer = new IntersectionObserver((entries) =>
		{
			entries.forEach(entry =>
			{
				if (entry.isIntersecting)
				{
                    // @ts-ignore
					const messageId = parseInt(entry.target.dataset.messageId);
					if (messageId)
					{
						this.markMessageAsRead(messageId);
						// Stop observing this message once it's been marked as read
						this.observer.unobserve(entry.target);
					}
				}
			});
		}, this.observerOptions);
	}

	/**
	 * Mark a message as read (debounced to avoid excessive API calls).
	 *
	 * @param {number} messageId
	 * @returns {void}
	 */
	markMessageAsRead(messageId)
	{
		// Track the highest message ID seen
		if (!this.lastReadMessageId || messageId > this.lastReadMessageId)
		{
			this.lastReadMessageId = messageId;

			// Debounce the API call
			clearTimeout(this.readTimeout);
			this.readTimeout = setTimeout(() =>
			{
				new MessageModel({ conversationId: this.conversationId })
					.xhr.markAsRead({ messageId: this.lastReadMessageId }, (response) =>
					{
						if (response && response.success)
						{
							console.log('Messages marked as read up to:', this.lastReadMessageId);
						}
					});
			}, this.debounceDelay);
		}
	}

	/**
	 * Start observing a message element.
	 *
	 * @param {HTMLElement} element
	 * @returns {void}
	 */
	observe(element)
	{
		if (this.observer && element)
		{
			this.observer.observe(element);
		}
	}

	/**
	 * Stop observing a message element.
	 *
	 * @param {HTMLElement} element
	 * @returns {void}
	 */
	unobserve(element)
	{
		if (this.observer && element)
		{
			this.observer.unobserve(element);
		}
	}

	/**
	 * Clean up the observer and timers.
	 *
	 * @returns {void}
	 */
	destroy()
	{
		if (this.observer)
		{
			this.observer.disconnect();
			this.observer = null;
		}

		clearTimeout(this.readTimeout);
		this.readTimeout = null;
	}
}

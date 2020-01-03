
export abstract class Event {
	/**
	 * Whether the event has been handled by a layer. 
	 * 
	 * This value is set to the return value of Layer.onEvent(...).
	 * 
	 * When this value is set to true, the below layers will not get the event.
	 */
	public handled: boolean;

	/**
	 * Returns the event's type.
	 * 
	 * It is recommended that subclasses use the format '<Namespace>:<ClassName>' to avoid duplicates and confusion.
	 * 
	 * @returns {string} The event type.
	 */
	public abstract getEventType(): string;

	/**
	 * Get event information as a string.
	 * @returns {string} The event as a string.
	 */
	public abstract toString(): string;
}

export class EventDispatcher {

	private event: Event;

	/**
	 * Create a new event dispatcher.
	 * @param {Event} event The event to be dispatched. 
	 */
	public constructor(event: Event) {
		this.event = event;
	}

	/**
	 * Dispatch an event to a function which handles it.
	 * @param {new (...args: any[]) => T} t The event class, eg Polar.MouseMoveEvent.
	 * @param {(event: T) => boolean} func The event callback function. This will only be run for events with the specified type. Return false to allow this event to continue down the layer stack. Return true to block the event from travelling down the layer stack.
	 * @returns {boolean} Whether the event was of the specified type.
	 */
	public dispatch<T extends Event>(t: new (...args: any[]) => T, func: (event: T) => boolean): boolean {
		if (this.event.getEventType() === (new t()).getEventType()) {
			this.event.handled = func(<T>this.event);
			return true;
		}
		return false;
	}
}

/** A class which is able to handle events with an onEvent function. */
export interface EventHandler {
	/**
	 * Called on the occurrence of an event. 
	 * @param {Event} event The event.
	 */
 	onEvent(event: Event): void;
}

export interface EventCreator {
	/**
	 * Call this to send an event to the application.
	 */
	eventCallbackFn: (event: Event) => void;
}
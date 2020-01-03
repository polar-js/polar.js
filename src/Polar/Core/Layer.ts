import { Event, EventHandler, EventCreator } from '../Events/Event';

/** Represents a layer to be rendered to. */
export abstract class Layer implements EventHandler, EventCreator {
	private debugName: string;

	public eventCallbackFn: (event: Event) => void;
	
	/** Create a new layer. */
	public constructor(name: string) {
		this.debugName = name;
	}

	/** Called when the layer is attached to the application. */
	public onAttach() {};
	/** Called when the layer is detached from the application. */
	public onDetach() {};
	/** Called every update cycle. */
	public onUpdate(deltaTime: number) {};
	
	/**
	 * Called whenever an event is raised by the application.
	 * @param {Event} event The event.
	 */
	public onEvent(event: Event) {};

	/**
	 * Get the debug name of the layer.
	 * @returns {string} The debug name.
	 */
	public getName(): string {
		return this.debugName;
	}
}
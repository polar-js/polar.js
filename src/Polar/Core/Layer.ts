
/** Represents a layer to be rendered to. */
export class Layer {
	private debugName: string;

	/** Create a new layer. */
	public constructor(name: string) {
		this.debugName = name;
	}

	/** Called when the layer is attached to the application. */
	public onAttach() {}
	/** Called when the layer is detached from the application. */
	public onDetach() {}
	/** Called every update cycle. */
	public onUpdate(deltaTime: number) {}

	/**
	 * Get the debug name of the layer.
	 * @returns {string} The debug name.
	 */
	public getName(): string {
		return this.debugName;
	}
}
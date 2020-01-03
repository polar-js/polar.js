import { Layer } from './Layer';

export class LayerStack {
	
	public layers: Layer[];
	private layerInsertIndex = 0;

	/** Create a new layer stack. */
	public constructor() {
		this.layers = [];
	}

	/**
	 * Push a layer onto the top of the other layers.
	 * @param {type} Layer The layer.
	 */
	public pushLayer(layer: Layer) {
		this.layers.splice(this.layerInsertIndex, 0, layer);
		this.layerInsertIndex++;
	}

	/**
	 * Push an overlay layer on top of all other overlay layers.
	 * @param {type} Layer The overlay layer.
	 */
	public pushOverlay(overlay: Layer) {
		this.layers.push(overlay);
	}

	/**
	 * Remove a layer from the layer stack.
	 * @param {type} Layer The layer.
	 */
	public popLayer(layer: Layer) {
		this.layers = this.layers.filter(item => item != layer);
		this.layerInsertIndex--;
	}

	/**
	 * Remove an overlay layer from the layer stack.
	 * @param {type} Layer The overlay layer.
	 */
	public popOverlay(overlay: Layer) {
		this.layers = this.layers.filter(item => item != overlay);
	}

	/** Called every update cycle. Updates the layer stack. */
	public onUpdate(deltaTime: number) {
		for (const layer of this.layers) {
			layer.onUpdate(deltaTime);
		}
	}
}
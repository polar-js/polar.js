import Layer from 'Layer';

export default class LayerStack {
	private layers: Layer[];
	private layerInsertIndex = 0;

	public constructor() {
		this.layers = [];
	}

	/**
	 * pushLayer
	 * @param {type} Layer Layer to be pushed above all other layers, below overlays.
	 */
	public pushLayer(layer: Layer): void {
		this.layers.splice(this.layerInsertIndex, 0, layer);
		this.layerInsertIndex++;
	}

	/**
	 * pushOverlay
	 * @param {type} Layer Overlay to be pushed above all other layers and overlays.
	 */
	public pushOverlay(overlay: Layer): void {
		this.layers.push(overlay);
	}

	/**
	 * popLayer
	 * @param {type} Layer Layer to be removed from stack.
	 */
	public popLayer(layer: Layer): void {
		this.layers = this.layers.filter(item => item != layer);
		this.layerInsertIndex--;
	}

	/**
	 * popOverlay
	 * @param {type} Layer Overlay to be removed from stack.
	 */
	public popOverlay(overlay: Layer) {
		this.layers = this.layers.filter(item => item != overlay);
	}

	public onUpdate(deltaTime: number): void {
		for (const layer of this.layers) {
			layer.onUpdate(deltaTime);
		}
	}
}
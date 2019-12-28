import { Layer } from './Layer';
import { LayerStack } from './LayerStack';
import { Renderer } from '../Renderer/Renderer';
import { Surface } from '../Renderer/Surface';
import { Input } from './Input';
import { ApplicationSettings } from './ApplicationSettings';

/** Represents a Polar Application to be attached to the engine. */
export abstract class Application {
	private lastFrameTime: number = 0;
	private layerStack: LayerStack;
	private frameID: number;

	/**
	 * Create a new application.
	 * @param {ApplicationSettings} settings The settings.
	 */
	public constructor(settings: ApplicationSettings) {
		this.layerStack = new LayerStack();

		Surface.init(settings);
		Input.init();
		Renderer.init();
	}

	/** Starts the update loop of the application. */
	public start() {
		// Start the update loop.
		const update = (_: DOMHighResTimeStamp) => {
			const time = performance.now();
			const deltaTime = (time - this.lastFrameTime) / 1000;
			this.lastFrameTime = time;

			Surface.font.clearRect(0, 0, Surface.getWidth(), Surface.getHeight());
			this.layerStack.onUpdate(deltaTime);
			this.frameID = window.requestAnimationFrame(update);
		};

		update(null);
	}

	/** Stops the update loop of the application. */
	public stop() {
		console.assert(this.frameID != null, 'Application has not begun!');
		window.cancelAnimationFrame(this.frameID);
	}

	/** Add a new layer to the top of the current layers (Below overlays).
	 * @param {Layer} layer The layer.
	 */
	public pushLayer(layer: Layer) {
		this.layerStack.pushLayer(layer);
		layer.onAttach();
	}

	/** Add a new overlay layer to the top of the current overlays (Above everything).
	 * @param {Layer} layer The overlay layer.
	 */
	public pushOverlay(layer: Layer) {
		this.layerStack.pushOverlay(layer);
		layer.onAttach();
	}
}
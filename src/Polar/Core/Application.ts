import { vec4 } from 'gl-matrix';

import { Layer } from 'Polar/Core/Layer';
import { LayerStack } from 'Polar/Core/LayerStack';
import { RenderCommand } from '../Renderer/RenderCommand';
import { Renderer } from '../Renderer/Renderer';
import { Surface } from 'Polar/Renderer/Surface';
import { Input } from 'Polar/Core/Input';
import { Settings } from 'Polar/Core/Settings';

/** Represents a Polar Application to be attached to the engine. */
export abstract class Application {
	private lastFrameTime: number = 0;
	private layerStack: LayerStack;
	private frameID: number;

	public constructor(settings: Settings) {
		this.layerStack = new LayerStack();

		Surface.init(settings);
		Input.init();
		Renderer.init();
	}

	/** Starts the update loop of the application. */
	public start(): void {
		// Start the update loop.
		const update = (_: DOMHighResTimeStamp) => {
			const time = performance.now();
			const deltaTime = (time - this.lastFrameTime) / 1000;
			this.lastFrameTime = time;

			const color = vec4.create();
			color.set([0.0, 0.0, 0.0, 1.0]);
			RenderCommand.setClearColor(color);
			RenderCommand.clear();
			Surface.font.clearRect(0, 0, Surface.get().width, Surface.get().height);

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

	/** Adds a new layer to the top of the current layers (Below overlays). */
	public pushLayer(layer: Layer): void {
		this.layerStack.pushLayer(layer);
		layer.onAttach();
	}

	/** Adds a new layer to the top of the current overlays (Above everything).*/
	public pushOverlay(layer: Layer): void {
		this.layerStack.pushOverlay(layer);
		layer.onAttach();
	}
}
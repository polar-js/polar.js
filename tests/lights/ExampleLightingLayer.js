class ExampleLightingLayer extends Polar.Layer {
	constructor() {
		super('example');
	}

	onAttach() {
		// Create world manager.
		this.manager = new Polar.WorldManager(this.eventCallbackFn);

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.getWidth() / Polar.Surface.getHeight()));
		this.manager.addSingleton(new Polar.FPSDebugCP());
		this.manager.addSingleton(new CursorLightSingletonCP());

		this.manager.addSystem(new Polar.FPSDebugSystem());
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new CursorLightSystem());
		this.manager.addSystem(new Polar.LightRenderSystem());
		this.manager.addSystem(new Polar.RenderSystem());

		// Create the sprite's texture.
		const checkerboardTexture = new Polar.Texture2D();
		checkerboardTexture.loadFromPath('/textures/checkerboard.png');

		const boxEntity = this.manager.createEntity();
		boxEntity.addComponent(new Polar.TransformCP(0, 0, 0, 1, 1));
		boxEntity.addComponent(new Polar.Texture2DCP(checkerboardTexture));
		this.manager.registerComponents(boxEntity);

		const cursorLight = this.manager.createEntity();
		cursorLight.addComponent(new Polar.TransformCP(0, 0, 0, 1, 1));
		cursorLight.addComponent(new Polar.PointLightCP(Polar.makeVec3(1.0, 1.0, 1.0), 0.6));
		cursorLight.addComponent(new CursorLightCP());
		this.manager.registerComponents(cursorLight);

		document.getElementById('enable-lighting-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enableLighting();
			}
			else {
				Polar.Renderer.disableLighting();
			}
		});

		// Make game overlay stop events from propagating to the game canvas.
		for (const overlay of document.getElementsByClassName('game-overlay')) {
			overlay.addEventListener('mouseup', event => event.stopPropagation());
			overlay.addEventListener('mousedown', event => event.stopPropagation());
			overlay.addEventListener('click', event => event.stopPropagation());
		}

		// Get sliders and inputs.
		const redInput = document.getElementById('red-number');
		const redSlider = document.getElementById('red-slider');
		const greenInput = document.getElementById('green-number');
		const greenSlider = document.getElementById('green-slider');
		const blueInput = document.getElementById('blue-number');
		const blueSlider = document.getElementById('blue-slider');
		const intensitySlider = document.getElementById('intensity-slider');

		// Configure slider events.
		intensitySlider.onchange = () => {
			this.eventCallbackFn(new IntensityChangeEvent(intensitySlider.value));
		};

		redSlider.onchange = () => {
			redInput.value = redSlider.value;
			Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(redSlider.value / 255, greenSlider.value / 255, blueSlider.value / 255));
		};

		greenSlider.onchange = () => {
			greenInput.value = greenSlider.value;
			Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(redSlider.value / 255, greenSlider.value / 255, blueSlider.value / 255));
		};

		blueSlider.onchange = () => {
			blueInput.value = blueSlider.value;
			Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(redSlider.value / 255, greenSlider.value / 255, blueSlider.value / 255));
		};

		Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(redSlider.value / 255, greenSlider.value / 255, blueSlider.value / 255));
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
	}

	onEvent(event) {
		this.manager.onEvent(event);
	}
}

class CursorLightSystem extends Polar.System {

	onAttach() {}
	onDetach() {}
	beginUpdate(dt) {}

	onEntityUpdate(dt, entity, subIndex) {
		// Get the system data.
		const singleton = this.getManager().getSingleton('Sandbox:CursorLightSingleton');
		// Ensure the cursor light's intensity is set to the correct value.
		entity.getComponent('Polar:PointLight').intensity = singleton.intensity;
		// Update the cursor light's position if the mouse has moved.
		if (singleton.updatePosition) {
			singleton.updatePosition = false;
			const transform = entity.getComponent('Polar:Transform');
			
			transform.x = singleton.worldPosition[0];
			transform.y = singleton.worldPosition[1];

			transform.transform = Polar.createTransform(transform.x, transform.y, transform.rotation, transform.scaleX, transform.scaleY, 0);
		}
	}

	endUpdate(dt) {}

	onEvent(event) {
		const dispatcher = new Polar.EventDispatcher(event);

		// On mouse move --> Update the stored position.
		dispatcher.dispatch(Polar.MouseMoveEvent, mouseEvent => {
			const singleton = this.getManager().getSingleton('Sandbox:CursorLightSingleton');
			singleton.worldPosition = Polar.Renderer.screenToWorldPosition(Polar.makeVec2(mouseEvent.mouseX, mouseEvent.mouseY));
			singleton.updatePosition = true;
			return false;
		});

		// On mouse up --> Create a new light in the mouse's position.
		dispatcher.dispatch(Polar.MouseUpEvent, mouseEvent => {
			if (mouseEvent.button === 0) {
				const singleton = this.getManager().getSingleton('Sandbox:CursorLightSingleton');
				const manager = this.getManager();

				const lightEntity = manager.createEntity();
				lightEntity.addComponent(new Polar.TransformCP(
					singleton.worldPosition[0], singleton.worldPosition[1], 0, 
					singleton.radius, singleton.radius
				));
				lightEntity.addComponent(new Polar.PointLightCP(singleton.color, singleton.intensity));
				manager.registerComponents(lightEntity);

				singleton.lightCount++;
				document.getElementById('light-counter').innerText = `Light Count: ${singleton.lightCount}`;
			}
			return false;
		});

		// On intensity slider change --> Update the stored intensity value.
		dispatcher.dispatch(IntensityChangeEvent, intensityEvent => {
			this.getManager().getSingleton('Sandbox:CursorLightSingleton').intensity = intensityEvent.intensity;
			return false;
		});
	}

	getComponentTuples() {
		return [
			['Polar:Transform', 'Polar:PointLight', 'Sandbox:CursorLight']
		];
	}

	getName() {
		return 'Sandbox:CursorLightSystem';
	}
}

class CursorLightCP extends Polar.Component {

	constructor() {
		super();
		this.type = 'Sandbox:CursorLight';
	}
}

/**
 * A singleton component which stores information for the CursorLightSystem class.
 */
class CursorLightSingletonCP extends Polar.Component {

	constructor() {
		super();
		this.type = 'Sandbox:CursorLightSingleton';
		this.worldPosition = Polar.glm.vec2.fromValues(0, 0);
		this.intensity = 0.6;
		this.radius = 1.0;
		this.color = Polar.makeVec3(1.0, 1.0, 1.0);
		this.updatePosition = false;
		this.lightCount = 0;
	}
}

/**
 * Event triggered when the intensity slider changes.
 */
class IntensityChangeEvent extends Polar.Event {

	constructor(intensity) {
		super();
		this.intensity = intensity;
	}

	getEventType() {
		return 'Sandbox:IntensityChangeEvent';
	}

	toString() {
		return 'Sandbox:IntensityChangeEvent';
	}
}
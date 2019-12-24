class ExampleLightingLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.FPSDebugCP());

		this.manager.addSystem(new Polar.FPSDebugSystem());
		
		this.cameraController = new Polar.OrthographicCameraController(Polar.Surface.getWidth() / Polar.Surface.getHeight());

		// Create the sprite's texture.
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('/textures/checkerboard.png');
		// Create the sprite.
		this.checkerboardSprite = new Polar.Sprite(checkerboard);

		this.light1 = {
			transform: Polar.createTransform(0, 0),
			color: Polar.glm.vec3.fromValues(1, 1, 1),
			intensity: 1.0
		};

		this.lights = [{
			transform: Polar.createTransform(1, 0, 2, 2),
			position: Polar.glm.vec2.fromValues(0, 1),
			color: Polar.glm.vec3.fromValues(1, 0.5, 0.2),
			intensity: 1.0
		}];

		window.addEventListener('click', e => {
			this.lights.push(new Polar.PointLight(this.light1));
		});

		// Move the light to the cursor's position.
		window.addEventListener('mousemove', e => {
			var pos = Polar.Renderer.screenToWorldPosition(Polar.glm.vec2.fromValues(e.clientX, e.clientY));
			this.light1.transform = Polar.createTransform(pos[0], pos[1]);
		});

		Polar.Renderer.enableLighting();
		

		document.getElementById('enable-lighting-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enableLighting();
			}
			else {
				Polar.Renderer.disableLighting();
			}
		});

		const redInput = document.getElementById('red-number');
		const redSlider = document.getElementById('red-slider');
		const greenInput = document.getElementById('green-number');
		const greenSlider = document.getElementById('green-slider');
		const blueInput = document.getElementById('blue-number');
		const blueSlider = document.getElementById('blue-slider');
		const intensitySlider = document.getElementById('intensity-slider');

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

		intensitySlider.onchange = () => {
			this.light1.intensity = intensitySlider.value;
		};

		Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(redSlider.value / 255, greenSlider.value / 255, blueSlider.value / 255));
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
		this.cameraController.onUpdate(deltaTime);

		// Render
		Polar.Renderer.beginScene(this.cameraController.getCamera());

		Polar.Renderer.submitSprite(this.checkerboardSprite);
		Polar.LightRenderer.submitLight(this.light1);
		
		for (let light of this.lights) {
			Polar.LightRenderer.submitLight(light);
		}

		Polar.Renderer.endScene();
	}
}
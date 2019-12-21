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

		this.light2 = {
			transform: Polar.createTransform(1, 0, 2, 2),
			position: Polar.glm.vec2.fromValues(0, 1),
			color: Polar.glm.vec3.fromValues(1, 0.5, 0.2),
			intensity: 1.0
		};

		// Move the light to the cursor's position.
		window.addEventListener('mousemove', e => {
			var pos = Polar.Renderer.screenToWorldPosition(Polar.glm.vec2.fromValues(e.clientX, e.clientY));
			this.light1.transform = Polar.createTransform(pos[0], pos[1]);
		});

		Polar.Renderer.enableLighting();
		Polar.LightRenderer.setAmbientLightColor(Polar.glm.vec3.fromValues(0.05, 0.05, 0.05));

		document.getElementById('enable-lighting-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enableLighting();
			}
			else {
				Polar.Renderer.disableLighting();
			}
		});
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
		this.cameraController.onUpdate(deltaTime);

		// Render
		Polar.Renderer.beginScene(this.cameraController.getCamera());

		Polar.Renderer.submitSprite(this.checkerboardSprite);
		Polar.LightRenderer.submitLight(this.light1);
		Polar.LightRenderer.submitLight(this.light2);

		Polar.Renderer.endScene();
	}
}
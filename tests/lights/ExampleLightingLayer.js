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
			position: Polar.glm.vec2.fromValues(0, 0),
			color: Polar.glm.vec3.fromValues(1, 1, 1),
			radius: 1.0,
			intensity: 1.0
		};

		this.light2 = {
			position: Polar.glm.vec2.fromValues(0, 1),
			color: Polar.glm.vec3.fromValues(1, 0, 0),
			radius: 0.5,
			intensity: 0.8
		};

		Polar.Renderer.enableLighting();
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
		this.cameraController.onUpdate(deltaTime);

		// Render
		Polar.Renderer.beginScene(this.cameraController.getCamera());

		//Polar.Renderer.submitSprite(this.checkerboardSprite);
		Polar.LightRenderer.submitLight(this.light1);
		Polar.LightRenderer.submitLight(this.light2);

		Polar.Renderer.endScene();
	}
}
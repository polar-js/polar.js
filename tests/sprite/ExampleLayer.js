class ExampleLayer extends Polar.Layer {
	constructor() {
		super('example');
	}

	onAttach() {
		// Create the sprite's texture.
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('/textures/checkerboard.png');
		// Create the sprite.
		this.checkerboardSprite = new Polar.Sprite(checkerboard);
		
		// Allows the camera to be moved with user input.
		this.cameraController = new Polar.OrthographicCameraController(Polar.Surface.getWidth() / Polar.Surface.getHeight());
	}

	onUpdate(deltaTime) {
	    // Update the camera controller.
	    this.cameraController.onUpdate(deltaTime);

	    // Render the scene.
	    Polar.Renderer.beginScene(this.cameraController.getCamera());

		Polar.Renderer.submitSprite(this.checkerboardSprite);

	    Polar.Renderer.endScene();
	}

	onEvent(event) {
		this.cameraController.onEvent(event);
	}
}
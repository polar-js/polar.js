class ExampleLayer extends Polar.Layer {
	constructor() {
		super('example');

		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('/textures/checkerboard.png');
		this.checkerboardSprite = new Polar.Sprite(checkerboard);
		
		this.timeElapsed = 0;
		this.cameraController = new Polar.OrthographicCameraController(Polar.Surface.get().offsetWidth / Polar.Surface.get().offsetHeight);
		this.ready = true;
	}

	onUpdate(deltaTime) {
	    // Update
	    this.cameraController.onUpdate(deltaTime);

	    // Render
	    Polar.Renderer.beginScene(this.cameraController.getCamera());

		Polar.Renderer.submitSprite(this.checkerboardSprite);

	    Polar.Renderer.endScene();
	}
}
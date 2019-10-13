class ExampleECSLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.world = new Polar.WorldManager();

		// Initialize singletons.
		this.world.addSingleton(new Polar.CameraCP());
		this.world.addSingleton(new Polar.CameraControllerCP(Polar.Canvas.get().offsetWidth / Polar.Canvas.get().offsetHeight));

		// Add systems.
		this.world.addSystem(new Polar.RenderSystem());
		this.world.addSystem(new Polar.CameraControllerSystem());

		// Add entities.
		const entity = this.world.addEntity();

		entity.addComponent(new Polar.TransformCP());

		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('textures/checkerboard.png');
		entity.addComponent(new Polar.Texture2DCP(checkerboard));

		this.fpsTimer = new Polar.Timer(1, false, true);
		this.deltaNum = 0;
		this.currentFPS = 0;

		
		const atlas = new Polar.TextureAtlas(['textures/1.png', 'textures/2.png', 'textures/3.png', 'textures/4.png']);
	}

	onUpdate(deltaTime) {
		this.deltaNum++;
		if (this.fpsTimer.update(deltaTime)) {
			this.currentFPS = Math.round(this.deltaNum);
			this.deltaNum = 0;
		}

		Polar.Canvas.font.font = '20px Arial';
		Polar.Canvas.font.fillStyle = 'red';
		Polar.Canvas.font.fillText(`FPS: ${this.currentFPS}`, 10, 30);
		

		// Update
		this.world.onUpdate(deltaTime);
	}
}
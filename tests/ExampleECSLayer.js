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
		checkerboard.loadFromPath('checkerboard.png');
		entity.addComponent(new Polar.Texture2DCP(checkerboard));
	}

	onUpdate(deltaTime) {

		// Update
		this.world.onUpdate(deltaTime);
	}
}
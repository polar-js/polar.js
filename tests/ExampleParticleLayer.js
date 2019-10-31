
class ExampleParticleLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.get().offsetWidth / Polar.Surface.get().offsetHeight));
		this.manager.addSingleton(new Polar.FPSDebugCP());

		// Add systems.
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new Polar.FPSDebugSystem());
		this.manager.addSystem(new Polar.RenderSystem());

		// Add entities.
		// const entity = this.manager.createEntity();
		// entity.addComponent(new Polar.TransformCP());
		// const checkerboard = new Polar.Texture2D();
		// checkerboard.loadFromPath('textures/checkerboard.png');
		// entity.addComponent(new Polar.Texture2DCP(checkerboard));
		// this.manager.addEntitySubscriptions(entity.id);

		this.emitter = new Polar.ParticleEmitter(Polar.glm.vec2.create(), 10000, 10000, 0.5, 1, -Math.PI / 5, Math.PI / 5, 1, 2, Polar.glm.vec2.fromValues(0, -9.8));
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);

		Polar.ParticleRenderer.beginParticleScene(this.manager.getSingleton('Polar:Camera').camera);
		Polar.ParticleRenderer.renderParticleEmitter(this.emitter, deltaTime, 0);
		Polar.ParticleRenderer.endParticleScene();
	}
}
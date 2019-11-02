
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
		this.manager.addSystem(new Polar.ParticleSystem());

		const emitter = new Polar.ParticleEmitter({
			origin: [0, 0.5],
			angle: Math.PI / 12,
			spread: Math.PI / 5,
			numParticles: 20,
			spawnRate: 10,
			zIndex: 1,
			minSpeed: 0.3,
			maxSpeed: 0.6,
			minLife: 1,
			maxLife: 3,
			fadeTime: 2,
			gravity: [0, -1]
		});

		const entity = this.manager.createEntity();
		entity.addComponent(new Polar.ParticleEmitterCP(emitter));
		this.manager.addEntitySubscriptions(entity.id);
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
	}
}
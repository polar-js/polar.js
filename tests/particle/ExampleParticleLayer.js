
class ExampleParticleLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.getWidth() / Polar.Surface.getHeight()));
		this.manager.addSingleton(new Polar.FPSDebugCP());

		// Add systems.
		this.manager.addSystem(new ParticleWandSystem());
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new Polar.FPSDebugSystem());
		this.manager.addSystem(new Polar.RenderSystem());
		this.manager.addSystem(new Polar.ParticleSystem());

		const e = this.manager.createEntity();
		e.addComponent(new Polar.TransformCP());
		const alphatest = new Polar.Texture2D();
		alphatest.loadFromPath('/textures/alphatest.png');
		e.addComponent(new Polar.Texture2DCP(alphatest));
		this.manager.registerComponents(e);

		const fireTexture = new Polar.Texture2D();
		fireTexture.loadFromPath('/textures/fire.png');

		const mouseEmitter = new Polar.ParticleEmitter({
			origin: [0, 0.5],
			angle: Math.PI / 2,
			spread: Math.PI,
			numParticles: 50,
			spawnRate: 30,
			zIndex: 0.5,
			minSpeed: 0.1,
			maxSpeed: 0.6,
			minLife: 1,
			maxLife: 3,
			fadeTime: 0.5,
			gravity: [0, -1],
			mode: 'TEXTURE',
			texture: fireTexture,
			scale: 0.005,
			shrinkTime: 0
			
		});

		const smokeTexture = new Polar.Texture2D();
		smokeTexture.loadFromPath('/textures/smoke.png');
		const smokeEmitter = new Polar.ParticleEmitter({
			origin: [0, 0],
			angle: Math.PI / 2,
			spread: Math.PI,
			numParticles: 40,
			spawnRate: 5,
			zIndex: 0.7,
			minSpeed: 0.05,
			maxSpeed: 0.1,
			minLife: 1,
			maxLife: 3,
			fadeTime: 20,
			gravity: [0, 0.1],
			mode: 'TEXTURE',
			texture: smokeTexture,
			scale: 0.1,
			shrinkTime: 1.0
			
		});

		const mouseEmitterEntity = this.manager.createEntity();
		mouseEmitterEntity.addComponent(new Polar.ParticleEmitterCP(mouseEmitter));
		mouseEmitterEntity.addComponent(new ParticleWandCP());
		this.manager.registerComponents(mouseEmitterEntity);

		const smokeEntity = this.manager.createEntity();
		smokeEntity.addComponent(new Polar.ParticleEmitterCP(smokeEmitter));
		this.manager.registerComponents(smokeEntity);
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
	}


}

class ParticleWandSystem extends Polar.System {

	onAttach() {}
	onDetach() {}

	beginUpdate(dt) {}
	endUpdate(dt) {}

	onEntityUpdate(dt, entity, subIndex) {
		entity.getComponent('Polar:ParticleEmitter').emitter.origin = Polar.Renderer.screenToWorldPosition(Polar.Input.getMousePosition());
	}

	getComponentTuples() { return [['Sandbox:ParticleWand', 'Polar:ParticleEmitter']]; }
	getName() { return 'Sandbox:ParticleWandSystem'; }
}

class ParticleWandCP extends Polar.Component {
	constructor() {
		super();
		this.type = 'Sandbox:ParticleWand';
	}
}
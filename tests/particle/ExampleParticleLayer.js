
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

		const texture = new Polar.Texture2D();
		texture.loadFromPath('/textures/fire.png');

		const emitter = new Polar.ParticleEmitter({
			origin: [0, 0.5],
			angle: Math.PI / 2,
			spread: Math.PI,
			numParticles: 50,
			spawnRate: 30,
			zIndex: 1,
			minSpeed: 0.1,
			maxSpeed: 0.6,
			minLife: 1,
			maxLife: 3,
			fadeTime: 0.5,
			gravity: [0, -1],
			mode: 'TEXTURE',
			texture: texture,
			scale: 0.005,
			shrinkTime: 0
			
		});

		const entity = this.manager.createEntity();
		entity.addComponent(new Polar.ParticleEmitterCP(emitter));
		entity.addComponent(new ParticleWandCP());
		this.manager.registerComponents(entity);
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
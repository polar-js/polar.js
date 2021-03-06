class ExamplePhysicsLayer extends Polar.Layer {
	constructor() {
		super('example');
	}

	onAttach() {
		// Create world manager.
		this.manager = new Polar.WorldManager(this.eventCallbackFn);

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.getWidth() / Polar.Surface.getHeight(), 1, true));
		this.manager.addSingleton(new Polar.PhysicsWorldCP({ gravity: [0, -9.8] }));
		this.manager.addSingleton(new Polar.PhysicsDebugInteractionCP(true));
		this.manager.addSingleton(new Polar.FPSDebugCP());

		// Add systems.
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new Polar.PhysicsSystem());
		this.manager.addSystem(new Polar.PhysicsDebugInteractionSystem());
		this.manager.addSystem(new Polar.FPSDebugSystem());
		this.manager.addSystem(new Polar.RenderSystem());
		this.manager.addSystem(new Polar.PhysicsDebugRenderSystem());

		// Load texture
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('/textures/checkerboard.png');
		const circle = new Polar.Texture2D();
		circle.loadFromPath('/textures/circle.png');

		// Add entities.
		{
			const entity = this.manager.createEntity();
			entity.addComponent(new Polar.Texture2DCP(checkerboard));
			entity.addComponent(new Polar.BodyTextureAttachmentCP(0, 0, 0.5, 0.5, 0));

			const body = new Polar.p2.Body({
				mass: 1,
				position: [0, 1],
				fixedRotation: false
			});
			body.addShape(new Polar.p2.Box({
				width: 0.5,
				height: 0.5
			}));
			entity.addComponent(new Polar.PhysicsBodyCP(body));
			this.manager.getSingleton('Polar:PhysicsWorld').world.addBody(body);
			this.manager.registerComponents(entity);
		}

		{
			const entity = this.manager.createEntity();
			entity.addComponent(new Polar.Texture2DCP(checkerboard));
			entity.addComponent(new Polar.BodyTextureAttachmentCP(0, 0, 1, 1, 0));

			const body = new Polar.p2.Body({
				mass: 0,
				position: [0, -1]
			});
			body.addShape(new Polar.p2.Box({
				width: 1,
				height: 1
			}));
			entity.addComponent(new Polar.PhysicsBodyCP(body));
			this.manager.getSingleton('Polar:PhysicsWorld').world.addBody(body);
			this.manager.registerComponents(entity);
		}

		this.entityTimer = new Polar.Timer(0.5, false, true);
	}

	onUpdate(deltaTime) {
		// UPDATE ECS MANAGER //
		this.manager.onUpdate(deltaTime);
	}

	onEvent(event) {
		this.manager.onEvent(event);
	}
}
class ExamplePhysicsLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.get().offsetWidth / Polar.Surface.get().offsetHeight, 1));
		this.manager.addSingleton(new Polar.PhysicsWorldCP({ gravity: [0, -9.8] }));

		// Add systems.
		this.manager.addSystem(new Polar.RenderSystem());
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new Polar.PhysicsSystem());

		// Load texture
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('textures/checkerboard.png');

		// Add entities.
		{
			const entity = this.manager.createEntity();
			entity.addComponent(new Polar.Texture2DCP(checkerboard));

			const body = new Polar.p2.Body({
				mass: 5,
				position: [0.5, 2]
			});
			body.addShape(new Polar.p2.Box({
				width: 1,
				height: 1
			}));
			entity.addComponent(new Polar.PhysicsBodyCP(body, this.manager.getSingleton('Polar:PhysicsWorld').world));
			this.manager.addEntitySubscriptions(entity.id);
		}

		{
			// Add entities.
			const entity = this.manager.createEntity();
			entity.addComponent(new Polar.Texture2DCP(checkerboard));

			const body = new Polar.p2.Body({
				mass: 0,
				position: [0, -1]
			});
			body.addShape(new Polar.p2.Box({
				width: 1,
				height: 1
			}));
			entity.addComponent(new Polar.PhysicsBodyCP(body, this.manager.getSingleton('Polar:PhysicsWorld').world));
			this.manager.addEntitySubscriptions(entity.id);
		}
		

		this.fpsTimer = new Polar.Timer(1, false, true);
		this.deltaNum = 0;
		this.currentFPS = 0;

		// const testButton = document.createElement('button');
		// testButton.innerHTML = 'Test Button';
		// testButton.style.margin = '10px 100px';
		// Polar.Surface.ui.appendChild(testButton);

		// testButton.onclick = () => {
		// 	console.log('Adding entity...');
		// 	const testEntity = this.world.createEntity();
		// 	const texture = new Polar.Texture2D();
		// 	texture.loadFromPath('textures/1.png');
		// 	testEntity.addComponent(new Polar.Texture2DCP(texture));
		// 	this.world.addEntitySubscriptions(testEntity.id);
		// };

		this.entityTimer = new Polar.Timer(0.5, false, true);
	}

	onUpdate(deltaTime) {
		// FPS TIMER //
		this.deltaNum++;
		if (this.fpsTimer.update(deltaTime)) {
			this.currentFPS = Math.round(this.deltaNum);
			this.deltaNum = 0;
		}
		Polar.Surface.font.font = '20px Arial';
		Polar.Surface.font.fillStyle = 'red';
		Polar.Surface.font.fillText(`FPS: ${this.currentFPS}`, 10, 30);
		
		// UPDATE ECS MANAGER //
		this.manager.onUpdate(deltaTime);
	}
}
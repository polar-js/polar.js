class TestCP extends Polar.Component {
	constructor() {
		super();
	}

	getType() {
		return 'Sandbox:Test';
	}
}

class TestSystem extends Polar.System {

	onAttach() {
		console.log('Test system attach...');
	}

	onDetach() {
		console.log('Test system detach...');
	}

	beginUpdate(dt) {}

	onEntityUpdate(dt, entity, subIndex) {
		const transform = entity.getComponent('Polar:Transform');
		transform.x += 0.5 * dt;
		transform.y += 0.1 * dt;
		transform.recalculate();
		
	}

	endUpdate(dt) {}

	getComponentTuples() {
		return [['Polar:Transform', 'Sandbox:Test']];
	}

	getName() {
		return 'Sandbox:TestSystem';
	}
}

class ExampleECSLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.world = new Polar.WorldManager();

		// Initialize singletons.
		this.world.addSingleton(new Polar.CameraCP());
		this.world.addSingleton(new Polar.CameraControllerCP(Polar.Surface.get().offsetWidth / Polar.Surface.get().offsetHeight));

		// Add systems.
		this.world.addSystem(new Polar.RenderSystem());
		this.world.addSystem(new Polar.CameraControllerSystem());
		this.world.addSystem(new TestSystem());

		// Add entities.
		const entity = this.world.createEntity();
		entity.addComponent(new Polar.TransformCP());
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromPath('textures/checkerboard.png');
		entity.addComponent(new Polar.Texture2DCP(checkerboard));
		this.world.addEntitySubscriptions(entity.id);

		this.fpsTimer = new Polar.Timer(1, false, true);
		this.deltaNum = 0;
		this.currentFPS = 0;

		//const atlas = new Polar.TextureAtlas(['textures/1.png', 'textures/2.png', 'textures/3.png', 'textures/4.png', 'textures/5.png', 'textures/6.png']);

		const testButton = document.createElement('button');
		testButton.innerHTML = 'Test Button';
		testButton.style.margin = '10px 100px';
		Polar.Surface.ui.appendChild(testButton);

		testButton.onclick = () => {
			console.log('Adding entity...');
			const testEntity = this.world.createEntity();
			testEntity.addComponent(new Polar.TransformCP(0, 0, 0, 0.5));
			const texture = new Polar.Texture2D();
			texture.loadFromPath('textures/1.png');
			testEntity.addComponent(new Polar.Texture2DCP(texture));
			testEntity.addComponent(new TestCP());
			this.world.addEntitySubscriptions(testEntity.id);
		};

		this.entityTimer = new Polar.Timer(0.5, false, true);
	}

	onUpdate(deltaTime) {
		this.deltaNum++;
		if (this.fpsTimer.update(deltaTime)) {
			this.currentFPS = Math.round(this.deltaNum);
			this.deltaNum = 0;
		}

		Polar.Surface.font.font = '20px Arial';
		Polar.Surface.font.fillStyle = 'red';
		Polar.Surface.font.fillText(`FPS: ${this.currentFPS}`, 10, 30);

		if (this.entityTimer.update(deltaTime)) {
			const entity = this.world.createEntity();
			entity.addComponent(new Polar.TransformCP(0, -1, 45, 0.2));
			const texture = new Polar.Texture2D();
			texture.loadFromPath('textures/2.png');
			entity.addComponent(new Polar.Texture2DCP(texture));
			entity.addComponent(new TestCP());
			this.world.addEntitySubscriptions(entity.id);
		}
		
		this.world.onUpdate(deltaTime);
	}
}
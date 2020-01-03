class TestCP extends Polar.Component {
	constructor() {
		super();

		this.type = 'Sandbox:Test';
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
		transform.transform = Polar.createTransform(transform.x, transform.y, transform.rotation, transform.scaleX, transform.scaleY, 0);
	}

	endUpdate(dt) {}

	onEvent(event) {}

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
	}
	
	onAttach() {
		this.images = new Polar.ImageLibrary();
		this.images.loadPath('checkerboard', '/textures/checkerboard.png');
		this.images.loadPath('test1', '/textures/1.png');
		this.images.loadPath('test2', '/textures/2.png');

		// Create world manager.
		this.manager = new Polar.WorldManager(this.eventCallbackFn);

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.getWidth() / Polar.Surface.getHeight()));

		// Add systems.
		this.manager.addSystem(new TestSystem());
		this.manager.addSystem(new Polar.CameraControllerSystem());
		this.manager.addSystem(new Polar.RenderSystem());

		// Add entities.
		const entity = this.manager.createEntity();
		entity.addComponent(new Polar.TransformCP());
		const checkerboard = new Polar.Texture2D();
		checkerboard.loadFromImage(this.images.get('checkerboard'));
		entity.addComponent(new Polar.Texture2DCP(checkerboard));
		this.manager.registerComponents(entity);

		this.fpsTimer = new Polar.Timer(1, false, true);
		this.deltaNum = 0;
		this.currentFPS = 0;

		const testButton = document.getElementById('entity-button');

		testButton.onclick = () => {
			console.log('Adding entity...');
			const testEntity = this.manager.createEntity();
			testEntity.addComponent(new Polar.TransformCP(0, 1, 0, 0.5));
			const texture = new Polar.Texture2D();
			texture.loadFromImage(this.images.get('test1'));
			testEntity.addComponent(new Polar.Texture2DCP(texture));
			testEntity.addComponent(new TestCP());
			this.manager.registerComponents(testEntity);
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
			const entity = this.manager.createEntity();
			entity.addComponent(new Polar.TransformCP(0, -1, 45, 0.2));
			const texture = new Polar.Texture2D();
			texture.loadFromImage(this.images.get('test2'));
			entity.addComponent(new Polar.Texture2DCP(texture));
			entity.addComponent(new TestCP());
			this.manager.registerComponents(entity);
		}
		
		this.manager.onUpdate(deltaTime);
	}

	onEvent(event) {
		this.manager.onEvent(event);
	}
}
class TestCP extends Polar.Component {
	constructor() {
		super();
		this.type = 'Sandbox:Test';
	}
}

class TestSystem extends Polar.System {

	onAttach() {}

	onDetach() {}

	beginUpdate(dt) {}

	onEntityUpdate(dt, entity, subIndex) {
		const transform = entity.getComponent('Polar:Transform');
		transform.x += 0.5 * dt;
		transform.y += 0.1 * dt;
		transform.transform = Polar.createTransform(transform.x, transform.y, transform.scale, transform.scale, transform.rotation, 0);
	}

	endUpdate(dt) {}

	getComponentTuples() {
		return [['Polar:Transform', 'Sandbox:Test']];
	}

	getName() {
		return 'Sandbox:TestSystem';
	}
}

class ECSFromFileLayer extends Polar.Layer {
	constructor() {
		super('example');

		this.images = new Polar.ImageLibrary();
		this.images.loadPath('checkerboard', '/textures/checkerboard.png');
		this.images.loadPath('test1', '/textures/1.png');
		this.images.loadPath('test2', '/textures/2.png');

		Polar.ECSLoader.init();
		Polar.ECSLoader.registerSystem(new Polar.TextureLoadSystem());
		Polar.ECSLoader.registerSystem(new Polar.CameraControllerSystem());
		Polar.ECSLoader.registerSystem(new Polar.RenderSystem());
		Polar.ECSLoader.registerSystem(new Polar.TransformSystem());
		Polar.ECSLoader.registerSystem(new TestSystem());

		let ecsState = JSON.parse(`{
			"systemNames": ["Polar:TextureLoadSystem", "Polar:CameraControllerSystem", "Polar:TransformSystem", "Polar:RenderSystem", "Sandbox:TestSystem"],
			"singletons": {
				"components": [{
					"type": "Polar:TextureLibrary",
					"texturePaths": [["checkerboard", "/textures/checkerboard.png"]]
				},
				{
					"type": "Polar:Camera"
				},
				{
					"type": "Polar:CameraController",
					"aspectRatio": 0,
					"zoomLevel": 1,
					"doRotation": false,
					"cameraPosition": [0, 0, 0],
					"cameraRotation": 0,
					"cameraRotationSpeed": 1.57079632679
				}]
			},
			"entities": [{
				"components": [{
					"type": "Polar:Transform",
					"x": 0,
					"y": 0,
					"rotation": 0,
					"scale": 1,
					"modified": true,
					"transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
				},
				{
					"type": "Polar:TextureRef",
					"alias": "checkerboard",
					"width": 1,
					"height": 1
				},
				{
					"type": "Sandbox:Test"
				}]
			}]
		}`);

		// Create world manager.
		this.manager = new Polar.WorldManager(ecsState);

		this.fpsTimer = new Polar.Timer(1, false, true);
		this.deltaNum = 0;
		this.currentFPS = 0;

		let download = document.getElementById('download-ecs-state');
		download.style.display = 'none';
		document.getElementById('generate-ecs-state').onclick = () => {
			let data = new Blob([JSON.stringify(this.manager.exportState())], {type: 'application/json'});
			let url = window.URL.createObjectURL(data);
			download.href = url;
			download.style.display = 'block';
			console.log('click');
		};
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
		
		this.manager.onUpdate(deltaTime);
	}
}
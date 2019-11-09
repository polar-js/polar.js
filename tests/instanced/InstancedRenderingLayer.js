class InstancedRenderingLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.FPSDebugCP());

		this.manager.addSystem(new Polar.FPSDebugSystem());

		this.numLoaded = 0;
		this.image1 = new Image();
		this.image1.src = '/textures/checkerboard.png';
		if (this.image1.complete) {
			this.numLoaded += 1;
			if (this.numLoaded == 2) {
				this.finishLoad();
			}
		}
		else {
			this.image1.addEventListener('load', () => {
				this.numLoaded += 1;
				if (this.numLoaded == 2) {
					this.finishLoad();
				}
			});
		}
		this.image2 = new Image();
		this.image2.src = '/textures/1.png';
		if (this.image2.complete) {
			this.numLoaded += 1;
			if (this.numLoaded == 2) {
				this.finishLoad();
			}
		}
		else {
			this.image2.addEventListener('load', () => {
				this.numLoaded += 1;
				if (this.numLoaded == 2) {
					this.finishLoad();
				}
			});
		}
		
		this.cameraController = new Polar.OrthographicCameraController(Polar.Surface.getWidth() / Polar.Surface.getHeight());

		const numberInput = document.getElementById('num-instance-number');
		const numberSlider = document.getElementById('num-instance-slider');
		const instancingCheckbox = document.getElementById('instancing-checkbox');
		this.numInstances = 9;
		this.doInstancing = true;
		
		numberSlider.onchange = () => {
			numberInput.value = numberSlider.value ** 2;
			this.numInstances = numberSlider.value ** 2;
		};
		instancingCheckbox.onchange = () => {
			this.doInstancing = instancingCheckbox.checked;
		};

		this.rotation = 0;
		

		this.checkerboard = new Polar.Texture2D();
		this.checkerboard.loadFromPath('/textures/checkerboard.png');
	}

	finishLoad() {
		Polar.InstancedRenderer.useImages([['checkerboard', this.image1], ['1', this.image2]]);
	}

	onUpdate(deltaTime) {

		this.rotation += Math.PI / 2 * deltaTime;

		this.manager.onUpdate(deltaTime);
	    // Update
	    this.cameraController.onUpdate(deltaTime);

		// Render
		Polar.Renderer.beginScene(this.cameraController.getCamera());

		const size = Math.floor(Math.sqrt(this.numInstances));
		if (this.numLoaded == 2) {
			for (let y = Math.round(-size / 2); y < Math.round(size / 2); y++) {
				for (let x = Math.round(-size / 2); x < Math.round(size / 2); x++) {
					let transform = Polar.glm.mat4.create();
					transform = Polar.glm.mat4.fromTranslation(transform, Polar.glm.vec3.fromValues(x * 0.1, y * 0.1, 0.0));
					transform = Polar.glm.mat4.rotate(transform, transform, this.rotation, Polar.glm.vec3.fromValues(0.0, 0.0, 1.0));
					transform = Polar.glm.mat4.scale(transform, transform, Polar.glm.vec3.fromValues(0.09, 0.09, 1.0));
					
					if (this.doInstancing) {
						Polar.InstancedRenderer.submitTextured('checkerboard', transform);
					}
					else {
						Polar.Renderer.submitTextured(this.checkerboard, transform);
					}
				}
			}
		}

		Polar.Renderer.endScene();
	}
}
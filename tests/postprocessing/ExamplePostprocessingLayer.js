class ExamplePostprocessingLayer extends Polar.Layer {
	constructor() {
		super('example');

		// Create world manager.
		this.manager = new Polar.WorldManager();

		// Initialize singletons.
		this.manager.addSingleton(new Polar.CameraCP());
		this.manager.addSingleton(new Polar.CameraControllerCP(Polar.Surface.getWidth() / Polar.Surface.getHeight()));
		this.manager.addSingleton(new Polar.FPSDebugCP());

		// Add systems.
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
			spread: Math.PI / 4,
			numParticles: 100,
			spawnRate: 50,
			zIndex: 1,
			minSpeed: 0.1,
			maxSpeed: 0.6,
			minLife: 1,
			maxLife: 3,
			fadeTime: 0.5,
			gravity: [0, -1]
		});

		const entity = this.manager.createEntity();
		entity.addComponent(new Polar.ParticleEmitterCP(emitter));
		this.manager.registerComponents(entity);

		// SETUP POST PROCESSING //
		const invertShader = new Polar.Shader('InvertShader', Polar.InvertShaderSource.getVertexSource(), Polar.InvertShaderSource.getFragmentSource());
		const grayscaleShader = new Polar.Shader('GrayscaleShader', Polar.GrayscaleShaderSource.getVertexSource(), Polar.GrayscaleShaderSource.getFragmentSource());
		const vignetteShader = new Polar.Shader('VignetteShader', Polar.VignetteShaderSource.getVertexSource(), Polar.VignetteShaderSource.getFragmentSource());
		const blurShader = new Polar.Shader('BlurShader', Polar.GaussianBlurShaderSource.getVertexSource(), Polar.GaussianBlurShaderSource.getFragmentSource());

		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Invert', invertShader), false);
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Grayscale', grayscaleShader, false));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Vignette', vignetteShader, false, [['u_Brightness', [Polar.ShaderDataType.Float, 2]]]));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('HorizontalBlur', blurShader, false, [	
			['u_KernelSize', [Polar.ShaderDataType.Int, 9]],
			['u_Horizontal', [Polar.ShaderDataType.Bool, true]],
			['u_Weights', [Polar.ShaderDataType.FloatArray, [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216]]],
			['u_Spread', [Polar.ShaderDataType.Float, 1.0]]]));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('VerticalBlur', blurShader, false, [
			['u_KernelSize', [Polar.ShaderDataType.Int, 9]],
			['u_Horizontal', [Polar.ShaderDataType.Bool, false]],
			['u_Weights', [Polar.ShaderDataType.FloatArray, [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216]]],
			['u_Spread', [Polar.ShaderDataType.Float, 1.0]]]));

		document.getElementById('invert-colors-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enablePostprocessingStage('Invert');
			}
			else {
				Polar.Renderer.disablePostprocessingStage('Invert');
			}
		});
		document.getElementById('grayscale-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enablePostprocessingStage('Grayscale');
			}
			else {
				Polar.Renderer.disablePostprocessingStage('Grayscale');
			}
		});
		document.getElementById('vignette-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enablePostprocessingStage('Vignette');
			}
			else {
				Polar.Renderer.disablePostprocessingStage('Vignette');
			}
		});
		document.getElementById('blur-h-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enablePostprocessingStage('HorizontalBlur');
			}
			else {
				Polar.Renderer.disablePostprocessingStage('HorizontalBlur');
			}
		});
		document.getElementById('blur-v-checkbox').addEventListener('change', (event) => {
			if (event.target.checked) {
				Polar.Renderer.enablePostprocessingStage('VerticalBlur');
			}
			else {
				Polar.Renderer.disablePostprocessingStage('VerticalBlur');
			}
		});

		Polar.Renderer.disablePostprocessingStage('Invert');
		Polar.Renderer.disablePostprocessingStage('Grayscale');
		Polar.Renderer.disablePostprocessingStage('Vignette');
		Polar.Renderer.disablePostprocessingStage('HorizontalBlur');
		Polar.Renderer.disablePostprocessingStage('VerticalBlur');
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);
	}
}
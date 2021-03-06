class ExamplePostprocessingLayer extends Polar.Layer {
	constructor() {
		super('example');
	}

	onAttach() {
		// Create world manager.
		this.manager = new Polar.WorldManager(this.eventCallbackFn);

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
		e.addComponent(new Polar.TransformCP(0, 0, 0, 16/3, 3));
		const alphatest = new Polar.Texture2D();
		alphatest.loadFromPath('/textures/scene.png');
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
		const invertShader = new Polar.Shader('InvertShader', 
			Polar.InvertShaderSource.getVertexSource(), Polar.InvertShaderSource.getFragmentSource());
		const grayscaleShader = new Polar.Shader('GrayscaleShader', 
			Polar.GrayscaleShaderSource.getVertexSource(), Polar.GrayscaleShaderSource.getFragmentSource());
		const vignetteShader = new Polar.Shader('VignetteShader', 
			Polar.VignetteShaderSource.getVertexSource(), Polar.VignetteShaderSource.getFragmentSource());
		const blurShader = new Polar.Shader('BlurShader', 
			Polar.GaussianBlurShaderSource.getVertexSource(), Polar.GaussianBlurShaderSource.getFragmentSource());
		const chromaticAberrationShader = new Polar.Shader('ChromaticAberrationShader', 
			Polar.ChromaticAberrationShaderSource.getVertexSource(), Polar.ChromaticAberrationShaderSource.getFragmentSource());
		const grainShader = new Polar.Shader('grainShader', 
			Polar.GrainShaderSource.getVertexSource(), Polar.GrainShaderSource.getFragmentSource());

		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Invert', invertShader), false);
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Grayscale', grayscaleShader, false));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Vignette', vignetteShader, false, new Map([
			['u_Brightness', [Polar.ShaderDataType.Float, 2]]])));
		
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('HorizontalBlur', blurShader, false, new Map([	
			['u_KernelSize', [Polar.ShaderDataType.Int, 9]],
			['u_Horizontal', [Polar.ShaderDataType.Bool, true]],
			['u_Weights', [Polar.ShaderDataType.FloatArray, [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216]]],
			['u_Spread', [Polar.ShaderDataType.Float, 1.0]]])));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('VerticalBlur', blurShader, false, new Map([
			['u_KernelSize', [Polar.ShaderDataType.Int, 9]],
			['u_Horizontal', [Polar.ShaderDataType.Bool, false]],
			['u_Weights', [Polar.ShaderDataType.FloatArray, [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216]]],
			['u_Spread', [Polar.ShaderDataType.Float, 1.0]]])));
		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('ChromaticAberration', chromaticAberrationShader, false, new Map([
			['u_Intensity', [Polar.ShaderDataType.Float, 0.03]]
		])));

		Polar.Renderer.addPostprocessingStage(new Polar.PostprocessingStage('Grain', grainShader, false, new Map([
			['u_Intensity', [Polar.ShaderDataType.Float, 0.1]],
			['u_Variant', [Polar.ShaderDataType.Float, 0.2]]
		])));



		setupPostprocessingCheckbox('invert-colors-checkbox', 'Invert');
		setupPostprocessingCheckbox('grayscale-checkbox', 'Grayscale');
		setupPostprocessingCheckbox('vignette-checkbox', 'Vignette');
		setupPostprocessingCheckbox('blur-h-checkbox', 'HorizontalBlur');
		setupPostprocessingCheckbox('blur-v-checkbox', 'VerticalBlur');
		setupPostprocessingCheckbox('chromatic-aberration-checkbox', 'ChromaticAberration');
		setupPostprocessingCheckbox('grain-checkbox', 'Grain');

		this.doTrip = false;
		document.getElementById('trip-checkbox').addEventListener('change', event => {
			if (event.target.checked) {
				document.getElementById('blur-h-checkbox').checked = true;
				document.getElementById('blur-v-checkbox').checked = true;
				document.getElementById('chromatic-aberration-checkbox').checked = true;
				Polar.Renderer.enablePostprocessingStage('HorizontalBlur');
				Polar.Renderer.enablePostprocessingStage('VerticalBlur');
				Polar.Renderer.enablePostprocessingStage('ChromaticAberration');
				this.doTrip = true;
			}
			else {
				this.doTrip = false;
			}
		});

		Polar.Renderer.disablePostprocessingStage('Invert');
		Polar.Renderer.disablePostprocessingStage('Grayscale');
		Polar.Renderer.disablePostprocessingStage('Vignette');
		Polar.Renderer.disablePostprocessingStage('HorizontalBlur');
		Polar.Renderer.disablePostprocessingStage('VerticalBlur');
		Polar.Renderer.disablePostprocessingStage('ChromaticAberration');
		Polar.Renderer.disablePostprocessingStage('Grain');
	}

	onUpdate(deltaTime) {
		this.manager.onUpdate(deltaTime);

		Polar.Renderer.setPostprocessingStageUniform('Grain', 'u_Variant', Math.random());
		if (this.doTrip) {
			Polar.Renderer.setPostprocessingStageUniform('ChromaticAberration', 'u_Intensity', 0.02 * Math.sin(performance.now() / 350));
			Polar.Renderer.setPostprocessingStageUniform('HorizontalBlur', 'u_Spread', 5 * Math.sin(performance.now() / 400));
			Polar.Renderer.setPostprocessingStageUniform('VerticalBlur', 'u_Spread', 5 * Math.sin(performance.now() / 450));
		}
	}

	onEvent(event) {
		this.manager.onEvent(event);
	}
}

function setupPostprocessingCheckbox(id, stageName) {
	document.getElementById(id).addEventListener('change', event => {
		if (event.target.checked) {
			Polar.Renderer.enablePostprocessingStage(stageName);
		}
		else {
			Polar.Renderer.disablePostprocessingStage(stageName);
		}
	});
}
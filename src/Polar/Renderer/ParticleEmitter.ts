import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferLayout, BufferElement, ShaderDataType } from 'Polar/Renderer/Buffer';
import { Surface } from './Surface';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { Texture2D } from './Texture';

/** Settings for a particle emitter. */
export class ParticleEmitterSettings {
	/** The mode of the particle emitter. Can be 'POINTS' or 'TEXTURE' */
	public mode: string = 'POINTS';
	/** The total number of particles which can be released by the emitter at one time. */
	public numParticles: number = 100;
	/** The rate at which the particles are released, in particles per second. */
	public spawnRate: number = 100;
	/** The acceleration applied to all particles. */
	public gravity: glm.vec2 = glm.vec2.create();
	/** The position in the world where the particles are released. */
	public origin: glm.vec2 = glm.vec2.create();
	/** The direction which the center of the spread releases particles in radians. Starts from the right going anticlockwise (like a unit circle). */
	public angle: number = 0;
	/** The spread angle of the released particles in radians. */
	public spread: number = Math.PI / 2;
	/** The minimum speed of the particles. */
	public minSpeed: number = 1;
	/** The maximum speed of the particles. */
	public maxSpeed: number = 2;
	/** The minimum life of the particles. */
	public minLife: number = 1;
	/** The maximum life of the particles. */
	public maxLife: number = 2;
	/** How long it takes the particles fade. 
	 * The particles will have 100% opacity until the particle reaches the end of its life, where the opacity will be lowered for the specified time until it dies. 
	 */
	public fadeTime: number = 0;
	/** The z-index of the rendering. Allows objects to be rendered on top of each other. The highest zIndex gets its pixels rendered on top. */
	public zIndex: number = 0;
	/** The texture to be rendered on the particle. Used in conjunction with mode 'TEXTURE'. */
	public texture: Texture2D;
	/** The scale applied to the textured quad. Used in conjunction with mode 'TEXTURE'. */
	public scale: number = 1.0;
	/** How long it takes the particles shrink to nothing. 
	 * The particles will have 100% size until the particle reaches the end of its life, where the size will be lowered for the specified time until it dies.
	 * Used in conjunction with mode 'TEXTURE'.
	 */
	public shrinkTime: number = 0.0;
}

/** A class representing an emitter of particles, rendered through ParticleRenderer. */
export class ParticleEmitter {
	/** The mode of the particle emitter. Can be 'POINTS' or 'TEXTURE' */
	public mode: string;
	/** The total number of particles which can be released by the emitter at one time. */
	public numParticles: number;
	/** The rate at which the particles are released, in particles per second. */
	public spawnRate: number;
	/** The number of particles which have been born. */
	public bornParticles: number = 0;
	/** The acceleration applied to all particles. */
	public gravity: glm.vec2;
	/** The position in the world where the particles are released. */
	public origin: glm.vec2;
	/** The direction which the center of the spread releases particles in radians. Starts from the right going anticlockwise (like a unit circle). */
	public angle: number;
	/** The spread angle of the released particles in radians. */
	public spread: number;
	/** The minimum speed of the particles. */
	public minSpeed: number;
	/** The maximum speed of the particles. */
	public maxSpeed: number;
	/** The minimum life of the particles. */
	public minLife: number;
	/** The maximum life of the particles. */
	public maxLife: number;
	/** How long it takes the particles fade. 
	 * The particles will have 100% opacity until the particle reaches the end of its life, where the opacity will be lowered for the specified time until it dies. 
	 */
	public fadeTime: number;
	/** The z-index of the rendering. Allows objects to be rendered on top of each other. The highest zIndex gets its pixels rendered on top. */
	public zIndex: number;
	/** The texture to be rendered on the particle. Used in conjunction with mode 'TEXTURE'. */
	public texture: Texture2D;
	/** The scale applied to the textured quad. Used in conjunction with mode 'TEXTURE'. */
	public scale: number;
	/** How long it takes the particles shrink to nothing. 
	 * The particles will have 100% size until the particle reaches the end of its life, where the size will be lowered for the specified time until it dies.
	 * Used in conjunction with mode 'TEXTURE'.
	 */
	public shrinkTime: number;

	/** The vertex buffers used by the ParticleRenderer.
	 * @internal
	 */
	public buffers: VertexBuffer[];
	/** The vertex arrays used by the ParticleRenderer.
	 * @internal
	 */
	public vertexArrays: VertexArray[];
	/** The index to the current read buffer.
	 * @internal
	 */
	public read = 0;
	/** The index to the current read buffer.
	 * @internal
	 */
	public write = 1;

	/**
	 * Create a new particle emitter.
	 * @param {ParticleEmitterSettings} settings The settings. 
	 */
	public constructor(settings: ParticleEmitterSettings) {
		if (settings.mode) this.mode = settings.mode.toUpperCase();
		else this.mode = 'POINTS';
		
		this.numParticles = settings.numParticles;
		this.spawnRate = settings.spawnRate;
		this.gravity = settings.gravity;
		this.origin = settings.origin;
		this.angle = settings.angle;
		this.spread = settings.spread;
		this.minSpeed = settings.minSpeed;
		this.maxSpeed = settings.maxSpeed;
		this.minLife = settings.minLife;
		this.maxLife = settings.maxLife;
		this.fadeTime = settings.fadeTime;
		this.zIndex = settings.zIndex;
		this.texture = settings.texture;
		this.scale = settings.scale || 1.0;
		this.shrinkTime = settings.shrinkTime;

		// VALIDATE INPUT //
		if (this.maxLife < this.minLife) 
			console.error('Maximum life cannot be less than minimum life.');
		
		if (this.maxSpeed < this.minSpeed)
			console.error('Maximum speed cannot be less than minimum speed');
		
		// SETUP BUFFERS //
		this.buffers = [
			new VertexBuffer(initialParticleData(this.numParticles, this.minLife, this.maxLife), Surface.gl.STREAM_DRAW),
			new VertexBuffer(initialParticleData(this.numParticles, this.minLife, this.maxLife), Surface.gl.STREAM_DRAW)
		];
		
		this.vertexArrays = [new VertexArray(), new VertexArray(), new VertexArray(), new VertexArray()];
		let layout;
		layout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'i_Position', false, 0),
			new BufferElement(ShaderDataType.Float, 'i_Age', false, 0),
			new BufferElement(ShaderDataType.Float, 'i_Life', false, 0),
			new BufferElement(ShaderDataType.Float2, 'i_Velocity', false, 0)
		]);
		
		this.buffers[0].setLayout(layout);
		this.buffers[1].setLayout(layout);

		this.vertexArrays[0].addVertexBuffer(this.buffers[0], ParticleRenderer.getUpdateShader());
		this.vertexArrays[1].addVertexBuffer(this.buffers[1], ParticleRenderer.getUpdateShader());
		

		if (this.mode === 'TEXTURE') {
			layout = new BufferLayout([
				new BufferElement(ShaderDataType.Float2, 'i_Position', false, 1),
				new BufferElement(ShaderDataType.Float, 'i_Age', false, 1),
				new BufferElement(ShaderDataType.Float, 'i_Life', false, 1),
				new BufferElement(ShaderDataType.Float2, 'i_Velocity', false, 1)
			]);
			this.buffers[0].setLayout(layout);
			this.buffers[1].setLayout(layout);
			this.vertexArrays[2].addVertexBuffer(this.buffers[0], ParticleRenderer.getRenderTextureShader());
			this.vertexArrays[3].addVertexBuffer(this.buffers[1], ParticleRenderer.getRenderTextureShader());
			
			// SETUP TEXTURE RENDERING BUFFERS //

			const quadVertices = [
				-0.5, -0.5, 0.0, 1.0,
				0.5, -0.5, 1.0, 1.0,
				0.5,  0.5, 1.0, 0.0,
				-0.5, -0.5, 0.0, 1.0,
				0.5,  0.5, 1.0, 0.0,
				-0.5,  0.5, 0.0, 0.0
			];
			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float2, 'i_Coord', false, 0),
				new BufferElement(ShaderDataType.Float2, 'i_TexCoord', false, 0)
			]);

			quadVB.setLayout(quadLayout);
			this.vertexArrays[2].addVertexBuffer(quadVB, ParticleRenderer.getRenderTextureShader());
			this.vertexArrays[3].addVertexBuffer(quadVB, ParticleRenderer.getRenderTextureShader());

		}
		else {
			this.vertexArrays[2].addVertexBuffer(this.buffers[0], ParticleRenderer.getRenderPointShader());
			this.vertexArrays[3].addVertexBuffer(this.buffers[1], ParticleRenderer.getRenderPointShader());
		}
	}
}

function initialParticleData(numParticles: number, minLife: number, maxLife: number): Float32Array {
	let data: number[] = [];
	for (let i = 0; i < numParticles; ++i) {
		// Add position.
		data.push(0.0);
		data.push(0.0);
	
		// Add age and life.
		let life = minLife + Math.random() * (maxLife - minLife);

		// Add age and life.
		data.push(life + 1);
		data.push(life);
	
		// Add velocity.
		data.push(0.0);
		data.push(0.0);
	}
	return new Float32Array(data);
}
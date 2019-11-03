import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferLayout, BufferElement, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { Surface } from './Surface';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { Texture2D } from './Texture';
import { Renderer } from './Renderer';

export class ParticleEmitterSettings {
	public numParticles: number = 100;
	public spawnRate: number = 100;
	public gravity: glm.vec2 = glm.vec2.create();
	public origin: glm.vec2 = glm.vec2.create();
	public angle: number = 0;
	public spread: number = Math.PI / 2;
	public minSpeed: number = 1;
	public maxSpeed: number = 2;
	public minLife: number = 1;
	public maxLife: number = 2;
	public fadeTime: number = 0;
	public zIndex: number = 0;
	public mode: string = 'POINTS';
	public texture: Texture2D;
	public scale: number = 1.0;
	public shrinkTime: number = 0.0;
}

export class ParticleEmitter {
	
	public mode: string;

	public buffers: VertexBuffer[];
	public vertexArrays: VertexArray[];
	public read = 0;
	public write = 1;

	public numParticles: number;
	public spawnRate: number;
	public bornParticles: number = 0;
	public gravity: glm.vec2;
	public origin: glm.vec2;
	public angle: number;
	public spread: number;
	public minSpeed: number;
	public maxSpeed: number;
	public minLife: number;
	public maxLife: number;
	public fadeTime: number;
	public zIndex: number;
	public texture: Texture2D;
	public scale: number;
	public shrinkTime: number;

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
		// if (this.mode === 'TEXTURE') {
		// 	layout = new BufferLayout([
		// 		new BufferElement(ShaderDataType.Float2, 'i_Position', false, 1),
		// 		new BufferElement(ShaderDataType.Float, 'i_Age', false, 1),
		// 		new BufferElement(ShaderDataType.Float, 'i_Life', false, 1),
		// 		new BufferElement(ShaderDataType.Float2, 'i_Velocity', false, 1)
		// 	]);
		// }
		// else {
		layout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'i_Position', false, 0),
			new BufferElement(ShaderDataType.Float, 'i_Age', false, 0),
			new BufferElement(ShaderDataType.Float, 'i_Life', false, 0),
			new BufferElement(ShaderDataType.Float2, 'i_Velocity', false, 0)
		]);
		//}
		
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
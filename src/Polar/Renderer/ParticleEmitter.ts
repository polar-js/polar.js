import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferLayout, BufferElement, ShaderDataType } from 'Polar/Renderer/Buffer';
import { Surface } from './Surface';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { Texture2D } from './Texture';

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
}

export class ParticleEmitter {

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

	//position: glm.vec2 = glm.vec2.create(), numParticles: number = 100, spawnRate: number = 100, minLife: number = 1, maxLife: number = 2, 
	//angle: number = 0, spread: number = Math.PI / 2, minSpeed: number = 1, maxSpeed: number = 2, gravity: glm.vec2 = glm.vec2.create(), zIndex: number = 0
	public constructor(settings: ParticleEmitterSettings) {
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
		const layout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'i_Position'),
			new BufferElement(ShaderDataType.Float, 'i_Age'),
			new BufferElement(ShaderDataType.Float, 'i_Life'),
			new BufferElement(ShaderDataType.Float2, 'i_Velocity')
		]);
		
		this.buffers[0].setLayout(layout);
		this.buffers[1].setLayout(layout);

		this.vertexArrays[0].addVertexBuffer(this.buffers[0], ParticleRenderer.getUpdateShader());
		this.vertexArrays[1].addVertexBuffer(this.buffers[1], ParticleRenderer.getUpdateShader());
		this.vertexArrays[2].addVertexBuffer(this.buffers[0], ParticleRenderer.getRenderShader());
		this.vertexArrays[3].addVertexBuffer(this.buffers[1], ParticleRenderer.getRenderShader());
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
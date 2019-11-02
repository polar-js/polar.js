import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferLayout, BufferElement, ShaderDataType } from 'Polar/Renderer/Buffer';
import { Surface } from './Surface';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { Texture2D } from './Texture';

export interface ParticleEmitterSettings {
	numParticles: number;
	spawnRate: number;
	gravity: glm.vec2;
	origin: glm.vec2;
	angle: number;
	spread: number;
	minSpeed: number;
	maxSpeed: number;
	minLife: number;
	maxLife: number;
	fadeTime: number;
	zIndex: number;
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
		this.numParticles = settings.numParticles || 100;
		this.spawnRate = settings.spawnRate || 100;
		this.gravity = settings.gravity || glm.vec2.create();
		this.origin = settings.origin || glm.vec2.create();
		this.angle = settings.angle || 0;
		this.spread = settings.spread || Math.PI / 2;
		this.minSpeed = settings.minSpeed || 1;
		this.maxSpeed = settings.maxSpeed || 2;
		this.minLife = settings.minLife || 1;
		this.maxLife = settings.maxLife || 2;
		this.fadeTime = settings.fadeTime || 0;
		this.zIndex = settings.zIndex || 0;
		
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
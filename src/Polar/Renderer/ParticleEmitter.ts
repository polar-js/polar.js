import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferLayout, BufferElement, ShaderDataType } from 'Polar/Renderer/Buffer';
import { Surface } from './Surface';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { Texture2D } from './Texture';

export class ParticleEmitter {

	public buffers: VertexBuffer[];
	public vertexArrays: VertexArray[];
	public read = 0;
	public write = 1;

	public numParticles: number;
	public spawnRate: number;
	public bornParticles: number = 0;
	public gravity: glm.vec2;
	public position: glm.vec2;
	public minAngle: number;
	public maxAngle: number;
	public minSpeed: number;
	public maxSpeed: number;

	public constructor(position: glm.vec2 = glm.vec2.create(), numParticles: number = 100, spawnRate: number = 100, minLife: number = 1, maxLife: number = 2, 
		minAngle: number = -Math.PI / 4, maxAngle: number = Math.PI / 4, minSpeed: number = 1, maxSpeed: number = 2, gravity: glm.vec2 = glm.vec2.create()) {
		this.numParticles = numParticles;
		this.spawnRate = spawnRate;
		this.gravity = gravity;
		this.position = position;
		this.minAngle = minAngle;
		this.maxAngle = maxAngle;
		this.minSpeed = minSpeed;
		this.maxSpeed = maxSpeed;
		
		// VALIDATE INPUT //
		if (maxLife < minLife) 
			console.error('Maximum life cannot be less than minimum life.');
		
		if (maxAngle < minAngle || minAngle < -Math.PI || maxAngle > Math.PI)
			console.error('Invalid angle range.');
		
		if (maxSpeed < minSpeed)
			console.error('Maximum speed cannot be less than minimum speed');
		
		// SETUP BUFFERS //
		this.buffers = [
			new VertexBuffer(initialParticleData(numParticles, minLife, maxLife), Surface.gl.STREAM_DRAW),
			new VertexBuffer(initialParticleData(numParticles, minLife, maxLife), Surface.gl.STREAM_DRAW)
		];

		this.vertexArrays = [new VertexArray(), new VertexArray(), new VertexArray(), new VertexArray()];
		const layout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'i_Position'),
			new BufferElement(ShaderDataType.Float, 'i_Age'),
			new BufferElement(ShaderDataType.Float, 'i_Life'),
			new BufferElement(ShaderDataType.Float2, 'i_Velocity'),
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

		// set age to max. life + 1 to ensure the particle gets initialized
		// on first invocation of particle update shader
		data.push(life + 1);
		data.push(life);
	
		// Add velocity.
		data.push(0.0);
		data.push(0.0);
	}
	return new Float32Array(data);
}
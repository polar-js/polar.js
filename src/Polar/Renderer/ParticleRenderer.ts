import * as glm from 'gl-matrix';
import { Shader } from 'Polar/Renderer/Shader';
import { Surface } from 'Polar/Renderer/Surface';
import * as ParticleUpdateShaderSource from 'Polar/Renderer/ShaderSource/ParticleUpdateShaderSource';
import * as ParticleRenderShaderSource from 'Polar/Renderer/ShaderSource/ParticleRenderShaderSource';
import { ParticleEmitter } from './ParticleEmitter';
import { Texture2D } from './Texture';
import { RenderCommand } from './RenderCommand';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';

export class ParticleRenderer {

	private static readonly RAND_WIDTH = 512;
	private static readonly RAND_HEIGHT = 512;

	private static updateShader: Shader;
	private static renderShader: Shader;
	private static randTexture: Texture2D;

	private static viewProjectionMatrix: glm.mat4;

	public static init() {
		this.updateShader = new Shader('ParticleUpdateShader', ParticleUpdateShaderSource.getVertexSource(), ParticleUpdateShaderSource.getFragmentSource(), 
			['v_Position', 'v_Age', 'v_Life', 'v_Velocity',]);
		this.renderShader = new Shader('ParticleRenderShader', ParticleRenderShaderSource.getVertexSource(), ParticleRenderShaderSource.getFragmentSource());
		this.randTexture = new Texture2D();
		this.randTexture.loadFromArray(this.randomRGData(this.RAND_WIDTH, this.RAND_HEIGHT), this.RAND_WIDTH, this.RAND_HEIGHT, Surface.gl.RG8, Surface.gl.RG);
	}

	public static getUpdateShader(): Shader {
		return this.updateShader;
	}

	public static getRenderShader(): Shader {
		return this.renderShader;
	}

	/** Begin the rendering of a scene. */
	public static beginParticleScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
	}

	/** End the rendering of a scene. */
	public static endParticleScene() {

	}

	public static renderParticleEmitter(emitter: ParticleEmitter, dt: number, zIndex = 0) {
		if (emitter.bornParticles < emitter.numParticles) {
			emitter.bornParticles = Math.min(emitter.numParticles, Math.floor(emitter.bornParticles + emitter.spawnRate * dt));
		}

		this.updateShader.bind();
		this.updateShader.uploadUniformFloat('u_DeltaTime', dt);
		// Upload total time?
		this.updateShader.uploadUniformFloat2('u_Gravity', emitter.gravity);
		this.updateShader.uploadUniformFloat2('u_Origin', emitter.position);
		this.updateShader.uploadUniformFloat('u_MinAngle', emitter.minAngle);
		this.updateShader.uploadUniformFloat('u_MaxAngle', emitter.maxAngle);
		this.updateShader.uploadUniformFloat('u_MinSpeed', emitter.minSpeed);
		this.updateShader.uploadUniformFloat('u_MaxSpeed', emitter.maxSpeed);
		
		this.randTexture.bind();
		this.updateShader.uploadUniformInt('u_RandNoise', 0);
		//this.randTexture.unbind();

		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, null);

		emitter.vertexArrays[emitter.read].bind();
		emitter.buffers[emitter.write].bindBufferBase(Surface.gl.TRANSFORM_FEEDBACK_BUFFER, 0);
		Surface.gl.enable(Surface.gl.RASTERIZER_DISCARD);

		Surface.gl.beginTransformFeedback(Surface.gl.POINTS);
		RenderCommand.drawArrays(emitter.bornParticles, Surface.gl.POINTS);
		Surface.gl.endTransformFeedback();

		Surface.gl.disable(Surface.gl.RASTERIZER_DISCARD);
		emitter.buffers[emitter.write].unbindBufferBase(Surface.gl.TRANSFORM_FEEDBACK_BUFFER, 0);

		// RENDER //
		emitter.vertexArrays[emitter.read + 2].bind();
		this.renderShader.bind();
		this.renderShader.uploadUniformFloat('u_zIndex', zIndex);
		this.renderShader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		RenderCommand.drawArrays(emitter.bornParticles, Surface.gl.POINTS);

		// SWAP BUFFERS //
		let tmp = emitter.read;
		emitter.read = emitter.write;
		emitter.write = tmp;
	}

	private static randomRGData(width: number, height: number): Uint8Array {
		let d = [];
		for (let i = 0; i < width * height; ++i) {
			d.push(Math.random() * 255.0);
			d.push(Math.random() * 255.0);
		}
		return new Uint8Array(d);
	}
}
import * as glm from 'gl-matrix';
import { Shader } from 'Polar/Renderer/Shader';
import { Surface } from 'Polar/Renderer/Surface';
import { ParticleEmitter } from 'Polar/Renderer/ParticleEmitter';
import { Texture2D } from 'Polar/Renderer/Texture';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import * as ParticleUpdateShaderSource from 'Polar/Renderer/ShaderSource/ParticleUpdateShaderSource';
import * as ParticlePointShaderSource from 'Polar/Renderer/ShaderSource/ParticlePointShaderSource';
import * as ParticleTextureShaderSource from 'Polar/Renderer/ShaderSource/ParticleTextureShaderSource';
import { VertexBuffer, IndexBuffer, BufferLayout, BufferElement, ShaderDataType } from 'Polar/Renderer/Buffer';
import { VertexArray } from 'Polar/Renderer/VertexArray';

export class ParticleRenderer {

	private static readonly RAND_WIDTH = 512;
	private static readonly RAND_HEIGHT = 512;

	private static updateShader: Shader;
	private static renderPointShader: Shader;
	private static renderTextureShader: Shader;
	private static randTexture: Texture2D;
	

	private static viewProjectionMatrix: glm.mat4;

	public static init() {
		// SETUP SHADERS //
		this.updateShader = new Shader('ParticleUpdateShader', ParticleUpdateShaderSource.getVertexSource(), ParticleUpdateShaderSource.getFragmentSource(), ['v_Position', 'v_Age', 'v_Life', 'v_Velocity']);
		this.renderPointShader = new Shader('ParticlePointShader', ParticlePointShaderSource.getVertexSource(), ParticlePointShaderSource.getFragmentSource());
		this.renderTextureShader = new Shader('ParticleTextureShader', ParticleTextureShaderSource.getVertexSource(), ParticleTextureShaderSource.getFragmentSource());

		// SETUP RANDOM TEXTURE //
		this.randTexture = new Texture2D();
		this.randTexture.loadFromArray(this.randomRGData(this.RAND_WIDTH, this.RAND_HEIGHT), this.RAND_WIDTH, this.RAND_HEIGHT, Surface.gl.RG8, Surface.gl.RG);

		
	}

	public static getUpdateShader(): Shader {
		return this.updateShader;
	}

	public static getRenderPointShader(): Shader {
		return this.renderPointShader;
	}

	public static getRenderTextureShader(): Shader {
		return this.renderTextureShader;
	}

	/** Begin the rendering of a scene. */
	public static beginParticleScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
	}

	/** End the rendering of a scene. */
	public static endParticleScene() {}

	public static renderParticleEmitter(emitter: ParticleEmitter, dt: number) {
		if (emitter.bornParticles < emitter.numParticles) {
			emitter.bornParticles = Math.min(emitter.numParticles, emitter.bornParticles + emitter.spawnRate * dt);
		}

		// UPDATE EMITTER //
		this.updateShader.bind();
		this.updateShader.uploadUniformFloat('u_DeltaTime', dt);
		this.updateShader.uploadUniformFloat2('u_Gravity', emitter.gravity);
		this.updateShader.uploadUniformFloat2('u_Origin', emitter.origin);
		this.updateShader.uploadUniformFloat('u_Angle', emitter.angle);
		this.updateShader.uploadUniformFloat('u_Spread', emitter.spread);
		this.updateShader.uploadUniformFloat('u_MinSpeed', emitter.minSpeed);
		this.updateShader.uploadUniformFloat('u_MaxSpeed', emitter.maxSpeed);
		
		this.randTexture.bind();
		this.updateShader.uploadUniformInt('u_RandNoise', 0);

		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, null);

		emitter.vertexArrays[emitter.read].bind();
		emitter.buffers[emitter.write].bindBufferBase(Surface.gl.TRANSFORM_FEEDBACK_BUFFER, 0);
		Surface.gl.enable(Surface.gl.RASTERIZER_DISCARD);

		Surface.gl.beginTransformFeedback(Surface.gl.POINTS);
		RenderCommand.drawArrays(Math.floor(emitter.bornParticles), Surface.gl.POINTS);
		Surface.gl.endTransformFeedback();

		Surface.gl.disable(Surface.gl.RASTERIZER_DISCARD);
		emitter.buffers[emitter.write].unbindBufferBase(Surface.gl.TRANSFORM_FEEDBACK_BUFFER, 0);

		// RENDER EMITTER //
		emitter.vertexArrays[emitter.read + 2].bind();
		if (emitter.mode === 'TEXTURE') {
			this.renderTextureShader.bind();
			this.renderTextureShader.uploadUniformFloat('u_zIndex', emitter.zIndex);
			this.renderTextureShader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
			this.renderTextureShader.uploadUniformFloat('u_FadeTime', emitter.fadeTime);
			this.renderTextureShader.uploadUniformFloat('u_Scale', emitter.scale);
			this.renderTextureShader.uploadUniformFloat('u_ShrinkTime', emitter.shrinkTime);
			this.renderTextureShader.uploadUniformInt('u_Texture', 0);
			emitter.texture.bind();
			RenderCommand.drawArraysInstanced(6, Math.floor(emitter.bornParticles));
		}
		else {
			this.renderPointShader.bind();
			this.renderPointShader.uploadUniformFloat('u_zIndex', emitter.zIndex);
			this.renderPointShader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
			this.renderPointShader.uploadUniformFloat('u_FadeTime', emitter.fadeTime);
			RenderCommand.drawArrays(Math.floor(emitter.bornParticles), Surface.gl.POINTS);
		}
		
		
		

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
import * as glm from 'gl-matrix';
import { Surface } from './Surface';
import { Shader } from './Shader';
import { FrameBuffer } from './FrameBuffer';
import { RenderBuffer } from './RenderBuffer';
import { VertexBuffer, IndexBuffer, BufferElement, BufferLayout, ShaderDataType } from './Buffer';
import { VertexArray } from './VertexArray';
import { Texture2D } from './Texture';
import { RenderCommand } from './RenderCommand';

export class PostprocessingStage {

	protected name: string;
	protected shader: Shader;
	protected fbo: FrameBuffer;
	protected screenVA: VertexArray;
	protected enabled: boolean;

	protected uniforms: Map<string, [ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array]>;

	/**
	 * Create a new postprocessing stage.
	 * @param {string} name The name of the stage.
	 * @param {Shader} shader The shader.
	 * @param {boolean} enabled Whether the stage will be used when rendering.
	 * @param {[string, ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array][]} uniforms Fixed value uniforms used in the shader. Format: [name, [ShaderDataType, value]]
	 * 
	 * @example uniforms = [['u_Brightness', [Polar.ShaderDataType.Float, 2]]]
	 */
	public constructor(name: string, shader: Shader, enabled = true, uniforms: Map<string, [ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array]> = new Map<string, [ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array]>()) {
		this.name = name;
		this.shader = shader;
		this.enabled = enabled;
		this.uniforms = uniforms;
		// SETUP FRAME BUFFER //
		this.fbo = new FrameBuffer();
		this.fbo.bind();

		// ATTACH TEXTURE //
		const texture = new Texture2D();
		texture.loadEmpty(Surface.getWidth(), Surface.getHeight(), Surface.gl.RGBA);
		texture.bind();
		this.fbo.attachTexture(texture, Surface.gl.COLOR_ATTACHMENT0);
		
		// ATTACH RENDER BUFFER //
		const rbo = new RenderBuffer();
		rbo.storage(Surface.getWidth(), Surface.getHeight(), Surface.gl.DEPTH24_STENCIL8);
		this.fbo.attachRenderbuffer(rbo);

		if (!this.fbo.isComplete())
			console.error('Framebuffer not complete!');
		
		this.screenVA = new VertexArray();

		const quadVertices = [
			-1, -1, 0.0, 0.0, 0,
			1, -1, 0.0, 1.0, 0,
			1,  1, 0.0, 1.0, 1.0,
			-1,  1, 0.0, 0.0, 1.0
		];

		const quadVB = new VertexBuffer(new Float32Array(quadVertices));

		const quadIndices = [0, 1, 2, 0, 2, 3];
		const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
		this.screenVA.setIndexBuffer(quadIB);

		const quadLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Float3, 'a_Position'),
			new BufferElement(ShaderDataType.Float2, 'a_TexCoord')
		]);

		quadVB.setLayout(quadLayout);
		this.screenVA.addVertexBuffer(quadVB, this.shader);

		this.screenVA.unbind();
		this.fbo.unbind();
		this.fbo.getTexture().unbind();

		var timeout: number = null;
		window.addEventListener('resize', () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				this.fbo.resize(Surface.getWidth(), Surface.getHeight());
			}, 100);
		});
	}

	/** Bind the postprocessing stage
	 * @internal
	 */
	public bind() {
		this.fbo.bind();
	}

	/** Unbinds the postprocessing stage
	 * @internal
	 */
	public unbind() {
		this.fbo.unbind();
	}

	/** Renders the stage to the currently bound framebuffer.
	 * @remarks Generally only used within the Polar Renderer.
	 */
	public render() {
		this.screenVA.bind();
		this.fbo.getTexture().bind();
		this.shader.bind();
		this.shader.uploadUniformInt('u_Texture', 0);
		this.uploadCustomUniforms();
		RenderCommand.drawElements(this.screenVA);
	}

	/** Get the name of the stage.
	 * @returns {string} The name.
	 */
	public getName(): string {
		return this.name;
	}

	/** Check if the stage is enabled.
	 * @returns {boolean} Whether the stage is enabled.
	 */
	public isEnabled(): boolean {
		return this.enabled;
	}

	/** Enables the stage. */
	public enable() {
		this.enabled = true;
	}

	/** Disables the stage. */
	public disable() {
		this.enabled = false;
	}

	protected uploadCustomUniforms() {
		for (const [name, [type, value]] of this.uniforms) {
			if (type === ShaderDataType.Int) {
				this.shader.uploadUniformInt(name, <number>value);
			}
			else if (type === ShaderDataType.Float) {
				this.shader.uploadUniformFloat(name, <number>value);
			}
			else if (type === ShaderDataType.Float2) {
				this.shader.uploadUniformFloat2(name, <glm.vec2>value);
			}
			else if (type === ShaderDataType.Float3) {
				this.shader.uploadUniformFloat3(name, <glm.vec3>value);
			}
			else if (type === ShaderDataType.Float4) {
				this.shader.uploadUniformFloat4(name, <glm.vec4>value);
			}
			else if (type === ShaderDataType.Mat3) {
				this.shader.uploadUniformMat3(name, <glm.mat3>value);
			}
			else if (type === ShaderDataType.Mat4) {
				this.shader.uploadUniformMat4(name, <glm.mat4>value);
			}
			else if (type === ShaderDataType.Bool) {
				this.shader.uploadUniformBool(name, <boolean>value);
			}
			else if (type === ShaderDataType.FloatArray) {
				this.shader.uploadUniformFloatArray(name, <Float32Array>value);
			}
			else {
				console.error(`Unknown ShaderDataType: '${type}'`);
			}
		}
	}

	/**
	 * Set a postprocessing uniform.
	 * @param {string} name The uniform's name within the shader.
	 * @param {number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array} value The value to set the uniform to.
	 */
	public setUniform(name: string, value: number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4 | boolean | Float32Array) {
		this.uniforms.set(name, [this.uniforms.get(name)[0], value]);
	}
}
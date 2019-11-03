import * as glm from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { Shader } from 'Polar/Renderer/Shader';
import { FrameBuffer } from 'Polar/Renderer/FrameBuffer';
import { RenderBuffer } from 'Polar/Renderer/RenderBuffer';
import { VertexBuffer, IndexBuffer, BufferElement, BufferLayout, ShaderDataType } from 'Polar/Renderer/Buffer';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { Texture2D } from 'Polar/Renderer/Texture';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';

export class PostprocessingStage {

	private name: string;
	private shader: Shader;
	private fbo: FrameBuffer;
	private screenVA: VertexArray;
	private enabled: boolean;

	private uniforms: [string, ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4][];

	public constructor(name: string, shader: Shader, enabled = true, uniforms: [string, ShaderDataType, number | glm.vec2 | glm.vec3 | glm.vec4 | glm.mat3 | glm.mat4][] = []) {
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

		window.addEventListener('resize', (ev: UIEvent) => {
			texture.loadEmpty(Surface.getWidth(), Surface.getHeight(), Surface.gl.RGBA);
			rbo.storage(Surface.getWidth(), Surface.getHeight(), Surface.gl.DEPTH24_STENCIL8);
		});
	}

	public bind() {
		this.fbo.bind();
	}

	public unbind() {
		this.fbo.unbind();
	}

	public render() {
		this.screenVA.bind();
		this.fbo.getTexture().bind();
		this.shader.bind();
		this.shader.uploadUniformInt('u_Texture', 0);
		for (const uniform of this.uniforms) {
			if (uniform[1] === ShaderDataType.Int) {
				this.shader.uploadUniformInt(uniform[0], <number>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Float) {
				this.shader.uploadUniformFloat(uniform[0], <number>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Float2) {
				this.shader.uploadUniformFloat2(uniform[0], <glm.vec2>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Float3) {
				this.shader.uploadUniformFloat3(uniform[0], <glm.vec3>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Float4) {
				this.shader.uploadUniformFloat4(uniform[0], <glm.vec4>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Mat3) {
				this.shader.uploadUniformMat3(uniform[0], <glm.mat3>uniform[2]);
			}
			else if (uniform[1] === ShaderDataType.Mat4) {
				this.shader.uploadUniformMat4(uniform[0], <glm.mat4>uniform[2]);
			}
		}
		RenderCommand.drawElements(this.screenVA);
	}

	public getName(): string {
		return this.name;
	}

	public isEnabled(): boolean {
		return this.enabled;
	}

	public enable() {
		this.enabled = true;
	}

	public disable() {
		this.enabled = false;
	}
}
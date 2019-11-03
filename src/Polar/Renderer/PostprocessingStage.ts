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

	public constructor(name: string, shader: Shader, enabled = true) {
		this.name = name;
		this.shader = shader;
		this.enabled = enabled;
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
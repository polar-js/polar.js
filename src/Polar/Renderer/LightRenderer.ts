import * as glm from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { Shader } from 'Polar/Renderer/Shader';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';
import { FrameBuffer } from 'Polar/Renderer/FrameBuffer';
import { Texture2D } from 'Polar/Renderer/Texture';
import * as LightShaderSource from 'Polar/Renderer/ShaderSource/LightShaderSource';
import { RenderBuffer } from 'Polar/Renderer/RenderBuffer';

export class Light2D {
	public position: glm.vec2;
	public color: glm.vec3;
	public radius: number;
	public intensity: number;
}

const MAX_LIGHTS = 1e4;

export class LightRenderer {

	private static viewProjectionMatrix: glm.mat4;

	private static lightData: Float32Array;
	private static lightCount: number;
	private static lightShader: Shader;
	private static instanceVA: VertexArray;
	private static instanceBuffer: VertexBuffer;
	private static lightFB: FrameBuffer;

	private static kernel: Float32Array = new Float32Array([1, 0.939, 0.7777, 0.5681, 0.366, 0.2079, 0.1042, 0.0461, 0.0179, 0.0062, 0]);

	public static init() {

		// SETUP FRAME BUFFER //
		this.lightFB = new FrameBuffer();
		this.lightFB.bind();

		// ATTACH TEXTURE //
		const texture = new Texture2D();
		texture.loadEmpty(Surface.getWidth(), Surface.getHeight(), Surface.gl.RGBA);
		texture.bind();
		this.lightFB.attachTexture(texture, Surface.gl.COLOR_ATTACHMENT0);

		// ATTACH RENDER BUFFER //
		const rbo = new RenderBuffer();
		rbo.storage(Surface.getWidth(), Surface.getHeight(), Surface.gl.DEPTH24_STENCIL8);
		this.lightFB.attachRenderbuffer(rbo);

		if (!this.lightFB.isComplete())
			console.error('Framebuffer not complete!');

		// SETUP SHADER //
		this.lightShader = new Shader('LightShader', LightShaderSource.getVertexSource(), LightShaderSource.getFragmentSource());

		// SETUP BUFFERS //
		this.instanceVA = new VertexArray();
		
		const quadVertices = [
			-0.5, -0.5,
			 0.5, -0.5,
			 0.5,  0.5,
			-0.5,  0.5
		];
		const quadVB = new VertexBuffer(new Float32Array(quadVertices));

		const quadIndices = [0, 1, 2, 0, 2, 3];
		const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
		this.instanceVA.setIndexBuffer(quadIB);

		const quadLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'a_VertPosition'),
		]);
		quadVB.setLayout(quadLayout);
		this.instanceVA.addVertexBuffer(quadVB, this.lightShader);
		
		// INVALID ENUM AFTER THIS //
		const instanceLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'a_Position', false, 1),
			new BufferElement(ShaderDataType.Float3, 'a_Color', false, 1),
			new BufferElement(ShaderDataType.Float, 'a_Intensity', false, 1),
			new BufferElement(ShaderDataType.Float, 'a_Radius', false, 1),
		]);
		this.lightData = new Float32Array(MAX_LIGHTS * instanceLayout.getStride());
		this.instanceBuffer = new VertexBuffer(this.lightData, Surface.gl.DYNAMIC_DRAW, MAX_LIGHTS * instanceLayout.getStride());
		this.instanceBuffer.setLayout(instanceLayout);
		this.instanceVA.addVertexBuffer(this.instanceBuffer, this.lightShader);

		this.instanceVA.unbind();
		this.lightFB.unbind();
		this.lightFB.getTexture().unbind();
	}

	public static submitLight(light: Light2D) {
		if (this.lightCount < MAX_LIGHTS) {
			this.lightData.set([light.position[0], light.position[1], 
				light.color[0], light.color[1], light.color[2],
				light.intensity, light.radius], this.lightCount * this.instanceBuffer.getLayout().getComponentCount());
			this.lightCount++;
		}
	}

	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		this.lightCount = 0;
		Surface.clear(glm.vec4.fromValues(0, 0, 0, 1));
		this.lightFB.bind();
	}

	public static endScene() {
		if (this.lightCount > 0) {
			this.instanceBuffer.setData(this.lightData, Surface.gl.DYNAMIC_DRAW);
	
			this.lightShader.bind();
			this.lightShader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
			this.lightShader.uploadUniformFloatArray('u_Kernel', this.kernel);
	
			this.instanceVA.bind();
			RenderCommand.drawElementsInstanced(this.instanceVA, this.lightCount);
		}
	}
}
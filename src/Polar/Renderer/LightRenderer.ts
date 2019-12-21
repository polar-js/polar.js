import * as glm from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { Shader } from 'Polar/Renderer/Shader';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';
import { FrameBuffer } from 'Polar/Renderer/FrameBuffer';
import { Texture2D } from 'Polar/Renderer/Texture';
import { RenderBuffer } from 'Polar/Renderer/RenderBuffer';
import * as LightShaderSource from 'Polar/Renderer/ShaderSource/LightShaderSource';
import * as MultiplyTextureShaderSource from 'Polar/Renderer/ShaderSource/MultiplyTextureShaderSource';

export class Light {
	public transform: glm.mat4;
	public color: glm.vec3;
	public intensity: number;

	public constructor(light: Light) {
		this.transform = light.transform;
		this.color = light.color;
		this.intensity = light.intensity;
	}
}

const MAX_LIGHTS = 1e4;

export class LightRenderer {

	private static ambientLightColor: glm.vec3 = glm.vec3.fromValues(0, 0, 0);

	private static viewProjectionMatrix: glm.mat4;

	private static lightShader: Shader;
	private static multiplyShader: Shader;

	private static lightData: Float32Array;
	private static lightCount: number;
	private static instanceVA: VertexArray;
	private static multiplyVA: VertexArray;
	private static instanceBuffer: VertexBuffer;
	private static spriteFB: FrameBuffer;
	private static lightFB: FrameBuffer;

	private static kernel: Float32Array = new Float32Array([1, 0.939, 0.7777, 0.5681, 0.366, 0.2079, 0.1042, 0.0461, 0.0179, 0.0062, 0]);

	public static init() {

		// SETUP FRAME BUFFER //
		this.lightFB = new FrameBuffer();
		this.lightFB.bind();

		// ATTACH TEXTURE //
		const lightTexture = new Texture2D();
		lightTexture.loadEmpty(Surface.getWidth(), Surface.getHeight(), Surface.gl.RGBA);
		lightTexture.bind();
		this.lightFB.attachTexture(lightTexture, Surface.gl.COLOR_ATTACHMENT0);

		// ATTACH RENDER BUFFER //
		const lightRB = new RenderBuffer();
		lightRB.storage(Surface.getWidth(), Surface.getHeight(), Surface.gl.DEPTH24_STENCIL8);
		this.lightFB.attachRenderbuffer(lightRB);

		if (!this.lightFB.isComplete())
			console.error('Framebuffer not complete!');

		// SETUP SPRITE FRAME BUFFER //
		this.spriteFB = new FrameBuffer();
		this.spriteFB.bind();

		// ATTACH TEXTURE //
		const spriteTexture = new Texture2D();
		spriteTexture.loadEmpty(Surface.getWidth(), Surface.getHeight(), Surface.gl.RGBA);
		spriteTexture.bind();
		this.spriteFB.attachTexture(spriteTexture, Surface.gl.COLOR_ATTACHMENT0);

		// ATTACH RENDER BUFFER //
		const spriteRB = new RenderBuffer();
		spriteRB.storage(Surface.getWidth(), Surface.getHeight(), Surface.gl.DEPTH24_STENCIL8);

		this.spriteFB.attachRenderbuffer(spriteRB);

		if (!this.spriteFB.isComplete())
			console.error('Framebuffer not complete!');

		var timeout: number = null;
		window.addEventListener('resize', () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				this.spriteFB.resize(Surface.getWidth(), Surface.getHeight());
				this.lightFB.resize(Surface.getWidth(), Surface.getHeight());
			}, 100);
		});
		
		// SETUP SHADER //
		this.lightShader = new Shader('LightShader', LightShaderSource.getVertexSource(), LightShaderSource.getFragmentSource());
		this.multiplyShader = new Shader('MultiplyShader', MultiplyTextureShaderSource.getVertexSource(), MultiplyTextureShaderSource.getFragmentSource());

		// SETUP BUFFERS //
		{
			this.instanceVA = new VertexArray();
		
			const quadVertices = [
				-1, -1,
				 1, -1,
				 1,  1,
				-1,  1
			];
			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadIndices = [0, 1, 2, 0, 2, 3];
			const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
			this.instanceVA.setIndexBuffer(quadIB);

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float2, 'a_Position'),
			]);
			quadVB.setLayout(quadLayout);
			this.instanceVA.addVertexBuffer(quadVB, this.lightShader);

			const instanceLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Mat4, 'a_Transform', false, 1),
				new BufferElement(ShaderDataType.Float3, 'a_Color', false, 1),
				new BufferElement(ShaderDataType.Float, 'a_Intensity', false, 1)
			]);
			this.lightData = new Float32Array(MAX_LIGHTS * instanceLayout.getStride());
			this.instanceBuffer = new VertexBuffer(this.lightData, Surface.gl.DYNAMIC_DRAW, MAX_LIGHTS * instanceLayout.getStride());
			this.instanceBuffer.setLayout(instanceLayout);
			this.instanceVA.addVertexBuffer(this.instanceBuffer, this.lightShader);
		}

		{
			this.multiplyVA = new VertexArray();
			
			const quadVertices = [
				-1.0, -1.0, 0.0, 0.0, 0.0,
				 1.0, -1.0, 0.0, 1.0, 0.0,
				 1.0,  1.0, 0.0, 1.0, 1.0,
				-1.0,  1.0, 0.0, 0.0, 1.0
			];
			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadIndices = [0, 1, 2, 0, 2, 3];
			const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
			this.multiplyVA.setIndexBuffer(quadIB);

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position'),
				new BufferElement(ShaderDataType.Float2, 'a_TexCoord'),
			]);
			quadVB.setLayout(quadLayout);
			this.multiplyVA.addVertexBuffer(quadVB, this.multiplyShader);
		}

		this.instanceVA.unbind();
		this.lightFB.unbind();
		this.lightFB.getTexture().unbind();
	}

	public static submitLight(light: Light) {
		if (this.lightCount < MAX_LIGHTS) {
			this.lightData.set(Float32Concat(light.transform, Float32Concat(light.color, new Float32Array([light.intensity]))), 
				this.lightCount * this.instanceBuffer.getLayout().getComponentCount());
			this.lightCount++;
		}
	}

	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		this.lightCount = 0;
		this.spriteFB.bind();
		Surface.clear();
	}

	public static endScene() {
		this.lightFB.bind();
		Surface.clear(glm.vec4.fromValues(this.ambientLightColor[0], this.ambientLightColor[1], this.ambientLightColor[2], 1));
		if (this.lightCount > 0) {
			this.instanceBuffer.setData(this.lightData, Surface.gl.DYNAMIC_DRAW);
	
			this.lightShader.bind();
			this.lightShader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
			this.lightShader.uploadUniformFloatArray('u_Kernel', this.kernel);
			this.lightShader.uploadUniformInt('u_InstanceCount', this.lightCount);
	
			this.instanceVA.bind();
			RenderCommand.drawElementsInstanced(this.instanceVA, this.lightCount);

			//console.log(`Rendering ${this.lightCount} lights!`);
		}
		this.lightFB.unbind();
	}

	public static render() {
		this.multiplyShader.bind();
		this.spriteFB.getTexture().bind(Surface.gl.TEXTURE0);
		this.lightFB.getTexture().bind(Surface.gl.TEXTURE1);

		this.multiplyShader.uploadUniformInt('u_SpriteTexture', 0);
		this.multiplyShader.uploadUniformInt('u_LightTexture', 1);

		this.multiplyVA.bind();
		RenderCommand.drawElements(this.multiplyVA);
	}

	public static setAmbientLightColor(color: glm.vec3)
	{
		this.ambientLightColor = color;
	}
}

// source: https://stackoverflow.com/questions/4554252/typed-arrays-in-gecko-2-float32array-concatenation-and-expansion //
function Float32Concat(first: Float32Array, second: Float32Array): Float32Array
{
	let firstLength = first.length;
	let result = new Float32Array(firstLength + second.length);

	result.set(first);
	result.set(second, firstLength);

	return result;
}
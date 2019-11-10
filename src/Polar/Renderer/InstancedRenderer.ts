import * as glm from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { Shader } from 'Polar/Renderer/Shader';
import { OrthographicCamera } from './OrthographicCamera';
import { TextureAtlas } from './TextureAtlas';
import { RenderCommand } from './RenderCommand';

import * as InstancedTextureShaderSource from 'Polar/Renderer/ShaderSource/InstancedTextureShaderSource';

/**
 * The maximum number of instances which can be rendered.
 * @type {number}
 */
const MAX_INSTANCES = 1e4;

/** The instanced renderer. */
export class InstancedRenderer {

	private static viewProjectionMatrix: glm.mat4;

	private static instanceCount: number;
	private static instancedTextureShader: Shader;
	private static instanceVA: VertexArray;
	private static instanceBuffer: VertexBuffer;
	private static textureAtlas: TextureAtlas;

	private static instanceData: Float32Array;

	/** Initialize the instanced renderer
	 * @remarks Only to be called by Renderer.
	 * @internal
	 */
	public static init() {

		this.textureAtlas = new TextureAtlas();
		
		this.instancedTextureShader = new Shader('InstancedTextureShader', InstancedTextureShaderSource.getVertexSource(), InstancedTextureShaderSource.getFragmentSource());

		this.instanceVA = new VertexArray();
		
		const quadVertices = [
			-0.5, -0.5, 0.0, 1.0,
			 0.5, -0.5, 1.0, 1.0,
			 0.5,  0.5, 1.0, 0.0,
			-0.5,  0.5, 0.0, 0.0
		];
		const quadVB = new VertexBuffer(new Float32Array(quadVertices));

		const quadIndices = [0, 1, 2, 0, 2, 3];
		const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
		this.instanceVA.setIndexBuffer(quadIB);

		const quadLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Float2, 'a_Position'),
			new BufferElement(ShaderDataType.Float2, 'a_TexCoord'),
		]);
		quadVB.setLayout(quadLayout);
		this.instanceVA.addVertexBuffer(quadVB, this.instancedTextureShader);
		
		// INVALID ENUM AFTER THIS //
		const instanceLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Mat4, 'a_Transform', false, 1),
			new BufferElement(ShaderDataType.Float4, 'a_AtlasBounds', false, 1)
		]);
		this.instanceData = new Float32Array(MAX_INSTANCES * instanceLayout.getStride());
		this.instanceBuffer = new VertexBuffer(this.instanceData, Surface.gl.DYNAMIC_DRAW, MAX_INSTANCES * instanceLayout.getStride());
		this.instanceBuffer.setLayout(instanceLayout);
		this.instanceVA.addVertexBuffer(this.instanceBuffer, this.instancedTextureShader);
	}

	/** Begin the instanced renderer scene
	 * @remarks
	 * Called only by Renderer
	 * 
	 * @param {OrthographicCamera} camera The camera.
	 * @internal
	 */
	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		this.instanceCount = 0;
	}

	/** Submit a texture for rendering.
	 * @param {string} textureAlias The texture's alias.
	 * @param {glm.mat4} transform The transform to be applied to the texture.
	 */
	public static submitTextured(textureAlias: string, transform: glm.mat4) {
		if (this.instanceCount < MAX_INSTANCES) {
			this.instanceData.set(Float32Concat(transform, this.textureAtlas.getBounds(textureAlias)), this.instanceCount * this.instanceBuffer.getLayout().getComponentCount());
			this.instanceCount++;
		}
	}

	/** Begin the instanced renderer scene
	 * @remarks Called only by Renderer
	 * @internal
	 */
	public static endScene() {
		if (this.instanceCount > 0) {
			this.textureAtlas.getTexture().bind();

			this.instanceBuffer.setData(this.instanceData, Surface.gl.DYNAMIC_DRAW);
	
			const shader = this.instancedTextureShader;
			shader.bind();
			shader.uploadUniformInt('u_Texture', 0);
			shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
	
			this.instanceVA.bind();
			RenderCommand.drawElementsInstanced(this.instanceVA, this.instanceCount);
		}
	}

	public static useImages(images: [string, HTMLImageElement][]) {
		this.textureAtlas.setImages(images);
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
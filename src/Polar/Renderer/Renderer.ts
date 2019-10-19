import { mat4 } from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { Shader } from 'Polar/Renderer/Shader';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';
import { OrthographicCamera } from 'Polar/Renderer/Camera';
import { ShaderLibrary } from 'Polar/Renderer/ShaderLibrary';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { Sprite } from 'Polar/Renderer/Sprite';
import { Texture2D } from 'Polar/Renderer/Texture';
import { TextureAtlas } from 'Polar/Renderer/TextureAtlas';
import { TransformCP } from 'Polar/ECS/Components';


import { Surface } from 'Polar/Renderer/Surface';

export  class Renderer {
	private static viewProjectionMatrix: mat4;
	private static quadVA: VertexArray;
	private static shaderLibrary: ShaderLibrary;
	private static textureAtlas: TextureAtlas;

	/** Initialize the renderer. */
	public static init() {
		RenderCommand.init();

		this.shaderLibrary = new ShaderLibrary();
		const textureShader = new Shader('TextureShader', 
			`#version 300 es
			precision highp float;
			
			layout(location = 0) in vec3 a_Position;
			layout(location = 1) in vec2 a_TexCoord;
			
			layout(location = 2) in mat4 a_Transform;
			
			uniform mat4 u_ViewProjection;
			uniform mat4 u_Transform;
			
			out vec3 v_Position;
			out vec2 v_TexCoord;
			
			void main() {
				v_TexCoord = a_TexCoord;
				gl_Position = u_ViewProjection * u_Transform * vec4(a_Position, 1.0);
			}`, 
			`#version 300 es
			precision mediump float;
			
			out vec4 color;
			in vec2 v_TexCoord;
			
			uniform sampler2D u_Texture;
			
			void main() {
				color = texture(u_Texture, v_TexCoord);
			}`);

		this.shaderLibrary.add(textureShader);

		this.quadVA = new VertexArray();

		const quadVertices = [
			-0.5, -0.5, 0.0, 0.0, 1.0,
			 0.5, -0.5, 0.0, 1.0, 1.0,
			 0.5,  0.5, 0.0, 1.0, 0.0,
			-0.5,  0.5, 0.0, 0.0, 0.0
		];

		const quadVB = new VertexBuffer(new Float32Array(quadVertices));

		const quadIndices = [0, 1, 2, 0, 2, 3];
		const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
		this.quadVA.setIndexBuffer(quadIB);

		const quadLayout = new BufferLayout([
			new BufferElement(ShaderDataType.Float3, 'a_Position'),
			new BufferElement(ShaderDataType.Float2, 'a_TexCoord')
		]);

		quadVB.setLayout(quadLayout);
		this.quadVA.addVertexBuffer(quadVB, textureShader);
	}

	/** Begin the rendering of a scene. */
	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		const shader = this.shaderLibrary.get('TextureShader');
		shader.bind();
	}

	/** End the rendering of a scene. */
	public static endScene() {

	}

	/** Submit a sprite for rendering.
	 * @param {Sprite} sprite The sprite to be rendered.
	 */
	public static submitSprite(sprite: Sprite) {
		const shader = this.shaderLibrary.get('TextureShader');
		sprite.getTexture().bind();

		shader.uploadUniformInt('u_Texture', 0);
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', sprite.getTransform());

		this.quadVA.bind();
		RenderCommand.drawIndexed(this.quadVA);
	}

	/** Submit a texture for rendering.
	 * @param {Texture2D} texture The texture.
	 * @param {mat4} transform The transform to be applied to the texture.
	 */
	public static submit(texture: Texture2D, transform: mat4) {
		const shader = this.shaderLibrary.get('TextureShader');
		texture.bind();

		shader.uploadUniformInt('u_Texture', 0);
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);

		this.quadVA.bind();
		RenderCommand.drawIndexed(this.quadVA);
	}

	// public static submitBatched(texturePath: string, transform: mat4) {
		
	// }

	/** Register the textures that the renderer will use.
	 * @param paths
	 */
	public static registerTextures(paths: string[]) {
		this.textureAtlas = new TextureAtlas(paths);
	}
}
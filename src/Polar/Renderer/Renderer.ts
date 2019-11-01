import * as glm from 'gl-matrix';
import { VertexArray } from 'Polar/Renderer/VertexArray';
import { Shader } from 'Polar/Renderer/Shader';
import { RenderCommand } from 'Polar/Renderer/RenderCommand';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import { ShaderLibrary } from 'Polar/Renderer/ShaderLibrary';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import { Sprite } from 'Polar/Renderer/Sprite';
import { Texture2D } from 'Polar/Renderer/Texture';
import { Surface } from 'Polar/Renderer/Surface';
import * as TextureShaderSource from 'Polar/Renderer/ShaderSource/TextureShaderSource';
import * as ColorShaderSource from 'Polar/Renderer/ShaderSource/ColorShaderSource';

import { createTransform } from 'Polar/Util/Math';

export  class Renderer {
	private static viewProjectionMatrix: glm.mat4;
	private static shaderLibrary: ShaderLibrary;

	private static textureQuadVA: VertexArray;
	private static colorQuadVA: VertexArray;
	private static outlineQuadVA: VertexArray;
	private static lineVA: VertexArray;
	private static circleVA: VertexArray;

	/** Initialize the renderer. */
	public static init() {
		RenderCommand.init();

		this.initShaders();
		this.initBuffers();
	}

	private static initShaders() {
		this.shaderLibrary = new ShaderLibrary();
		const textureShader = new Shader('TextureShader', TextureShaderSource.getVertexSource(), TextureShaderSource.getFragmentSource());
		this.shaderLibrary.add(textureShader);

		const colorShader = new Shader('ColorShader', ColorShaderSource.getVertexSource(), ColorShaderSource.getFragmentSource());
		this.shaderLibrary.add(colorShader);
	}

	private static initBuffers() {
		
		// CREATE TEXTURE QUAD //
		{
			this.textureQuadVA = new VertexArray();

			const quadVertices = [
				-0.5, -0.5, 0.0, 0.0, 1.0,
				 0.5, -0.5, 0.0, 1.0, 1.0,
				 0.5,  0.5, 0.0, 1.0, 0.0,
				-0.5,  0.5, 0.0, 0.0, 0.0
			];

			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadIndices = [0, 1, 2, 0, 2, 3];
			const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
			this.textureQuadVA.setIndexBuffer(quadIB);

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position'),
				new BufferElement(ShaderDataType.Float2, 'a_TexCoord')
			]);

			quadVB.setLayout(quadLayout);
			this.textureQuadVA.addVertexBuffer(quadVB, this.shaderLibrary.get('TextureShader'));
		}
		// CREATE COLORED QUAD //
		{
			this.colorQuadVA = new VertexArray();

			const quadVertices = [
				-0.5, -0.5, 0.0,
				 0.5, -0.5, 0.0,
				 0.5,  0.5, 0.0,
				-0.5,  0.5, 0.0,
			];

			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadIndices = [0, 1, 2, 0, 2, 3];
			const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
			this.colorQuadVA.setIndexBuffer(quadIB);

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position')
			]);

			quadVB.setLayout(quadLayout);
			this.colorQuadVA.addVertexBuffer(quadVB, this.shaderLibrary.get('ColorShader'));
			this.colorQuadVA.unbind();
		}
		// CREATE COLORED OUTLINE QUAD //
		{
			this.outlineQuadVA = new VertexArray();

			const quadVertices = [
				-0.5, -0.5, 0.0,
				 0.5, -0.5, 0.0,
				 0.5,  0.5, 0.0,
				-0.5,  0.5, 0.0,
			];

			const quadVB = new VertexBuffer(new Float32Array(quadVertices));

			const quadIndices = [0, 1, 2, 3];
			const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
			this.outlineQuadVA.setIndexBuffer(quadIB);

			const quadLayout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position')
			]);

			quadVB.setLayout(quadLayout);
			this.outlineQuadVA.addVertexBuffer(quadVB, this.shaderLibrary.get('ColorShader'));
			this.outlineQuadVA.unbind();
		}
		// CREATE LINE //
		{
			this.lineVA = new VertexArray();

			const vertices = [
				0.0, 0.0, 0.0,
				1.0, 0.0, 0.0,
			];

			const vertexBuffer = new VertexBuffer(new Float32Array(vertices));

			const indices = [0, 1];
			const indexBuffer = new IndexBuffer(new Uint16Array(indices));
			this.lineVA.setIndexBuffer(indexBuffer);

			const layout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position')
			]);

			vertexBuffer.setLayout(layout);
			this.lineVA.addVertexBuffer(vertexBuffer, this.shaderLibrary.get('ColorShader'));
			this.lineVA.unbind();
		}
		// CREATE CIRCLE //
		{
			this.circleVA = new VertexArray();

			const vertices: number[] = [];
			const indices: number[] = [];

			const resolution = 64;
			for (let i = 0; i < resolution; i++) {
				const angle = i / resolution * 2 * Math.PI;
				vertices.push(Math.cos(angle));
				vertices.push(Math.sin(angle));
				vertices.push(0.0);
				indices.push(i);
			}

			const vertexBuffer = new VertexBuffer(new Float32Array(vertices));

			const indexBuffer = new IndexBuffer(new Uint16Array(indices));
			this.circleVA.setIndexBuffer(indexBuffer);

			const layout = new BufferLayout([
				new BufferElement(ShaderDataType.Float3, 'a_Position')
			]);

			vertexBuffer.setLayout(layout);
			this.circleVA.addVertexBuffer(vertexBuffer, this.shaderLibrary.get('ColorShader'));
			this.circleVA.unbind();
		}
	}

	/** Begin the rendering of a scene. */
	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
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

		shader.bind();
		shader.uploadUniformInt('u_Texture', 0);
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', sprite.getTransform());

		this.textureQuadVA.bind();
		RenderCommand.drawIndexed(this.textureQuadVA);
	}

	/** Submit a texture for rendering.
	 * @param {Texture2D} texture The texture.
	 * @param {glm.mat4} transform The transform to be applied to the texture.
	 */
	public static submitTextured(texture: Texture2D, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('TextureShader');
		texture.bind();

		shader.bind();
		shader.uploadUniformInt('u_Texture', 0);
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);

		this.textureQuadVA.bind();
		RenderCommand.drawIndexed(this.textureQuadVA);
	}

	public static submitColored(color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		this.textureQuadVA.bind();
		RenderCommand.drawIndexed(this.textureQuadVA);
	}

	public static submitLines(linesVA: VertexArray, color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		linesVA.bind();
		RenderCommand.drawIndexedLines(linesVA);
	}

	public static submitLineStrip(stripVA: VertexArray, color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		stripVA.bind();
		RenderCommand.drawIndexedLineStrip(stripVA);
	}

	/**
	 * Draw a colored outline of a shape.
	 * @param {VertexArray} loopVA The loop's vertices.
	 * @param {glm.vec4} color The color of the square.
	 * @param {glm.mat4} transform The transformation matrix.
	 */
	public static submitLoop(loopVA: VertexArray, color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		loopVA.bind();
		RenderCommand.drawIndexedLineLoop(loopVA);
	}

	public static submitColoredOutline(color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		this.outlineQuadVA.bind();
		RenderCommand.drawIndexedLineLoop(this.outlineQuadVA);
	}

	public static submitLine(x0: number, y0: number, x1: number, y1: number, color: glm.vec4, zIndex: number = 0) {
		const shader = this.shaderLibrary.get('ColorShader');
		const dx = x1 - x0;
		const dy = y1 - y0;
		let angle = 0;
		if (dx == 0) {
			angle = dy > 0 ? 90 : 270;
		}
		else {
			angle = dx > 0 ? Math.atan(dy / dx) * 180 / Math.PI : 180 + Math.atan(dy / dx) * 180 / Math.PI;
		}

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', createTransform(x0, y0, Math.sqrt(dx*dx + dy*dy), 0, angle, zIndex));
		shader.uploadUniformFloat4('u_Color', color);

		this.lineVA.bind();
		RenderCommand.drawIndexedLineLoop(this.lineVA);
	}

	public static submitCircle(x: number, y: number, radius: number, color: glm.vec4, zIndex: number = 0) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', createTransform(x, y, radius, radius, zIndex));
		shader.uploadUniformFloat4('u_Color', color);

		this.circleVA.bind();
		RenderCommand.drawIndexedLineLoop(this.circleVA);
	}

	public static screenToWorldPosition(position: glm.vec2): glm.vec2 {
		const nx = position[0] / Surface.get().width * 2 - 1;
		const ny = -(position[1] / Surface.get().height * 2 - 1);
		let inverse = glm.mat4.create();
		inverse = glm.mat4.invert(inverse, this.viewProjectionMatrix);
		let out = glm.vec4.create();
		out = glm.vec4.transformMat4(out, glm.vec4.fromValues(nx, ny, 1, 1), inverse);
		
		return glm.vec2.fromValues(out[0], out[1]);
	}
}
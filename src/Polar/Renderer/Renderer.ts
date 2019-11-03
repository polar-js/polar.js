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
import { createTransform } from 'Polar/Util/Math';
import { ParticleRenderer } from './ParticleRenderer';
import { FrameBuffer } from 'Polar/Renderer/FrameBuffer';
import { RenderBuffer } from 'Polar/Renderer/RenderBuffer';
import * as TextureShaderSource from 'Polar/Renderer/ShaderSource/TextureShaderSource';
import * as ColorShaderSource from 'Polar/Renderer/ShaderSource/ColorShaderSource';
import * as ScreenShaderSource from 'Polar/Renderer/ShaderSource/PassthroughShaderSource';

export  class Renderer {
	private static viewProjectionMatrix: glm.mat4;
	private static shaderLibrary: ShaderLibrary;

	public static textureQuadVA: VertexArray;
	private static colorQuadVA: VertexArray;
	private static outlineQuadVA: VertexArray;
	private static lineVA: VertexArray;
	private static circleVA: VertexArray;
	
	// POST PROCESSING //
	private static doPostProcessing: boolean = false;
	private static fbo: FrameBuffer;
	private static screenVA: VertexArray;

	/** Initialize the renderer. */
	public static init() {
		RenderCommand.init();
		ParticleRenderer.init();

		this.initShaders();
		this.initBuffers();
		this.initPostprocessing();
	}

	private static initShaders() {
		this.shaderLibrary = new ShaderLibrary();
		const textureShader = new Shader('TextureShader', TextureShaderSource.getVertexSource(), TextureShaderSource.getFragmentSource());
		this.shaderLibrary.add(textureShader);

		const colorShader = new Shader('ColorShader', ColorShaderSource.getVertexSource(), ColorShaderSource.getFragmentSource());
		this.shaderLibrary.add(colorShader);

		this.shaderLibrary.add(new Shader('ScreenShader', ScreenShaderSource.getVertexSource(), ScreenShaderSource.getFragmentSource()));
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

	private static initPostprocessing() {
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
		this.screenVA.addVertexBuffer(quadVB, this.shaderLibrary.get('ScreenShader'));

		this.fbo.unbind();
		texture.unbind();
		this.screenVA.unbind();
	}

	/** Begin the rendering of a scene. */
	public static beginScene(camera: OrthographicCamera) {
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		
		RenderCommand.clear();
		if (this.doPostProcessing) {
			this.fbo.bind();
			RenderCommand.clear();
		}
	}

	/** End the rendering of a scene. */
	public static endScene() {
		if (this.doPostProcessing) {
			this.fbo.unbind();
			this.screenVA.bind();
			this.fbo.getTexture().bind();
			const shader = this.shaderLibrary.get('ScreenShader');
			shader.bind();
			shader.uploadUniformInt('u_Texture', 0);
			RenderCommand.drawElements(this.screenVA);
		}
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
		RenderCommand.drawElements(this.textureQuadVA);
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
		RenderCommand.drawElements(this.textureQuadVA);
	}

	/** Draw lines from a vertex array. 
	 * @param {VertexArray} linesVA The vertex array.
	 * @param {glm.vec4} color The color used to draw.
	 * @param {glm.mat4} transform The transformation matrix.
	*/
	public static submitLines(linesVA: VertexArray, color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		linesVA.bind();
		RenderCommand.drawElements(linesVA, Surface.gl.LINES);
	}

	/** Draw a line strip from a vertex array.
	 * @param {VertexArray} stripVA The vertex array.
	 * @param {glm.vec4} color The color used to draw.
	 * @param {glm.mat4} transform The transformation matrix.
	 */
	public static submitLineStrip(stripVA: VertexArray, color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		stripVA.bind();
		RenderCommand.drawElements(stripVA, Surface.gl.LINE_STRIP);
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
		RenderCommand.drawElements(loopVA, Surface.gl.LINE_LOOP);
	}

	/**
	 * Draw the outline of a quad.
	 * @param {glm.vec4} color The color used to draw.
	 * @param {glm.mat4} transform The transformation matrix. 
	 */
	public static submitColoredOutline(color: glm.vec4, transform: glm.mat4) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', transform);
		shader.uploadUniformFloat4('u_Color', color);

		this.outlineQuadVA.bind();
		RenderCommand.drawElements(this.outlineQuadVA, Surface.gl.LINE_LOOP);
	}

	/**
	 * Draw a single colored line.
	 * @param {number} x0 The first x coordinate.
	 * @param {number} y0 The first y coordinate.
	 * @param {number} x1 The second x coordinate.
	 * @param {number} y1 The second y coordinate.
	 * @param {glm.vec4} color The color used to draw.
	 * @param {number} [zIndex=0] How far / close the line is to the camera.
	 */
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
		RenderCommand.drawElements(this.lineVA, Surface.gl.LINE_LOOP);
	}

	/**
	 * Draw a colored circle outline.
	 * @param {number} x The x coordinate of the center of the circle.
	 * @param {number} y The y coordinate of the center of the circle.
	 * @param {number} radius The radius of the circle.
	 * @param {glm.vec4} color The color used to draw.
	 * @param {number} [zIndex=0] How far / close the line is to the camera.
	 */
	public static submitCircle(x: number, y: number, radius: number, color: glm.vec4, zIndex: number = 0) {
		const shader = this.shaderLibrary.get('ColorShader');

		shader.bind();
		shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
		shader.uploadUniformMat4('u_Transform', createTransform(x, y, radius, radius, zIndex));
		shader.uploadUniformFloat4('u_Color', color);

		this.circleVA.bind();
		RenderCommand.drawElements(this.circleVA, Surface.gl.LINE_LOOP);;
	}

	/** Get the world position from a screen position.
	 * @param {glm.vec2} position The screen position.
	 * @returns {glm.vec2} The world position.
	 */
	public static screenToWorldPosition(position: glm.vec2): glm.vec2 {
		const nx = position[0] / Surface.get().width * 2 - 1;
		const ny = -(position[1] / Surface.get().height * 2 - 1);
		let inverse = glm.mat4.create();
		inverse = glm.mat4.invert(inverse, this.viewProjectionMatrix);
		let out = glm.vec4.create();
		out = glm.vec4.transformMat4(out, glm.vec4.fromValues(nx, ny, 1, 1), inverse);
		
		return glm.vec2.fromValues(out[0], out[1]);
	}

	/** Enable postprocessing. */
	public static enablePostprocessing() {
		console.log('Enabling post processing...');
		this.doPostProcessing = true;
	}

	/** Disable postprocessing. */
	public static disablePostprocessing() {
		this.doPostProcessing =  false;
	}

	/** Set the postprocessing shader.
	 * @param {Shader} shader The shader.
	 */
	public static setPostprocessingShader(shader: Shader) {
		this.shaderLibrary.set(shader, 'ScreenShader');
		this.initPostprocessing();
	}
}
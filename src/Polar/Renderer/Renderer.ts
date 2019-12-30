import * as glm from 'gl-matrix';
import { VertexArray } from './VertexArray';
import { Shader } from './Shader';
import { RenderCommand } from './RenderCommand';
import { OrthographicCamera } from './OrthographicCamera';
import { ShaderLibrary } from './ShaderLibrary';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from './Buffer';
import { Sprite } from './Sprite';
import { Texture2D } from './Texture';
import { Surface } from './Surface';
import { createTransform } from '../Util/Math';
import { ParticleRenderer } from './ParticleRenderer';
import { InstancedRenderer } from './InstancedRenderer';
import { LightRenderer } from './LightRenderer';
import { PostprocessingStage } from './PostprocessingStage';
import * as TextureShaderSource from './ShaderSource/TextureShaderSource';
import * as ColorShaderSource from './ShaderSource/ColorShaderSource';

/** Handles the rendering objects to the canvas, including post.
 * 
 * @remarks For instanced rendering, see {@link Polar#InstancedRenderer | InstancedRenderer}
 */
export class Renderer {
	private static viewProjectionMatrix: glm.mat4;
	private static shaderLibrary: ShaderLibrary;

	private static textureQuadVA: VertexArray;
	private static colorQuadVA: VertexArray;
	private static outlineQuadVA: VertexArray;
	private static lineVA: VertexArray;
	private static circleVA: VertexArray;
	
	// POST PROCESSING //
	private static postprocessingStages: PostprocessingStage[];

	private static doLighting: boolean = false;

	/** Initialize the renderer. */
	public static init() {
		RenderCommand.init();
		ParticleRenderer.init();
		InstancedRenderer.init();
		LightRenderer.init();

		this.postprocessingStages = [];

		this.initShaders();
		this.initBuffers();
	}

	/** Initialize shaders */
	private static initShaders() {
		this.shaderLibrary = new ShaderLibrary();
		const textureShader = new Shader('TextureShader', TextureShaderSource.getVertexSource(), TextureShaderSource.getFragmentSource());
		this.shaderLibrary.add(textureShader);

		const colorShader = new Shader('ColorShader', ColorShaderSource.getVertexSource(), ColorShaderSource.getFragmentSource());
		this.shaderLibrary.add(colorShader);
	}

	/** Initialize buffers */
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

	/** Begin the rendering of a scene.
	 * @remarks To be called every frame before using any rendering commands. Used in conjunction with Renderer.endScene().
	 * @param {OrthographicCamera} camera The scene's camera.
	 */
	public static beginScene(camera: OrthographicCamera) {
		if (Surface.isResizing()) return;
			
		this.viewProjectionMatrix = camera.getViewProjectionMatrix();
		
		Surface.gl.bindFramebuffer(Surface.gl.FRAMEBUFFER, null);
		Surface.clear();
		for (const stage of this.postprocessingStages) {
			stage.bind();
			Surface.clear();
			stage.unbind();
		}

		if (this.doLighting) {
			LightRenderer.beginScene(camera);
		}
		else if (this.postprocessingStages.length >= 1) {
			const next = this.postprocessingStages.find((stage: PostprocessingStage) => {
				return stage.isEnabled();
			});
			if (next)  {
				next.bind();
			}
		}
		
		InstancedRenderer.beginScene(camera);
	}

	/** End the rendering of a scene.
	 * @remarks To be called every frame when all the rendering has been completed. Displays the results of all rendering commands.
	 */
	public static endScene() {
		if (Surface.isResizing()) return;
		InstancedRenderer.endScene();
		
		if (this.doLighting) {
			LightRenderer.endScene();
			if (this.postprocessingStages.length >= 1) {
				const next = this.postprocessingStages.find((stage: PostprocessingStage) => {
					return stage.isEnabled();
				});
				if (next)  {
					next.bind();
				}
			}
			LightRenderer.render();
		}

		for (let i = 0; i < this.postprocessingStages.length; i++) {
			// Get next enabled framebuffer.
			const next = this.postprocessingStages.slice(i + 1).find((stage: PostprocessingStage) => {
				return stage.isEnabled();
			});

			// Bind next frame buffer if it exists.
			if (next) next.bind();
			// Else target the screen's framebuffer (ie. none bound).
			else this.postprocessingStages[i].unbind();
			
			// Render the current stage to the next framebuffer.
			if (this.postprocessingStages[i].isEnabled())
				this.postprocessingStages[i].render();
		}
	}

	/** Submit a sprite for rendering.
	 * @param {Sprite} sprite The sprite to be rendered.
	 */
	public static submitSprite(sprite: Sprite) {
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
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
		if (Surface.isResizing()) return;
		const shader = this.shaderLibrary.get('ColorShader');
		const dx = x1 - x0;
		const dy = y1 - y0;
		let angle = 0;
		if (dx == 0) {
			angle = dy > 0 ? Math.PI / 2 : 3 * Math.PI / 2;
		}
		else {
			angle = dx > 0 ? Math.atan(dy / dx) : Math.PI + Math.atan(dy / dx);
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
		if (Surface.isResizing()) return;
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
		const nx = position[0] / Surface.getWidth() * 2 - 1;
		const ny = -(position[1] / Surface.getHeight() * 2 - 1);
		let inverse = glm.mat4.create();
		inverse = glm.mat4.invert(inverse, this.viewProjectionMatrix);
		let out = glm.vec4.create();
		out = glm.vec4.transformMat4(out, glm.vec4.fromValues(nx, ny, 1, 1), inverse);
		
		return glm.vec2.fromValues(out[0], out[1]);
	}

	/** 
	 * Adds a postprocessing stage to the end of the list.
	 * The order of the list is the order they will be applied.
	 * @param {PostprocessingStage} stage The stage.
	 */
	public static addPostprocessingStage(stage: PostprocessingStage) {
		this.postprocessingStages.push(stage);
	}

	/** 
	 * Adds a postprocessing stage to the end of the list.
	 * The order of the list is the order they will be applied.
	 * @param {string} name The name of the stage.
	 */
	public static removePostprocessingStage(name: string) {
		this.postprocessingStages.filter((value: PostprocessingStage, index: number, array: PostprocessingStage[]) => {
			return value.getName() !== name;
		});
	}

	/**
	 * Enable a postprocessing stage.
	 * @param {string} name The name of the stage.
	 */
	public static enablePostprocessingStage(name: string) {
		this.postprocessingStages.find((value: PostprocessingStage, index: number, array: PostprocessingStage[]) => {
			return value.getName() === name;
		}).enable();
	}

	/**
	 * Disable a postprocessing stage.
	 * @param {string} name The name of the stage.
	 */
	public static disablePostprocessingStage(name: string) {
		this.postprocessingStages.find((value: PostprocessingStage, index: number, array: PostprocessingStage[]) => {
			return value.getName() === name;
		}).disable();
	}

	/** Enable lighting. */
	public static enableLighting() {
		this.doLighting = true;
	}

	/** Disable lighting. */
	public static disableLighting() {
		this.doLighting = false;
	}
}
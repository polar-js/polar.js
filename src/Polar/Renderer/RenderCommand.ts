import * as glm from 'gl-matrix';
import { Surface } from './Surface';
import { VertexArray } from './VertexArray';

/** Static class which acts as an abstraction layer from raw OpenGL function calls. */
export class RenderCommand {

	/** Initialize the renderer. 
	 * @internal
	*/
	public static init() {
		Surface.gl.enable(Surface.gl.BLEND);
		Surface.gl.enable(Surface.gl.DEPTH_TEST);
		Surface.gl.blendFunc(Surface.gl.SRC_ALPHA, Surface.gl.ONE_MINUS_SRC_ALPHA);
	}

	/** Set the OpenGL clear color. */
	public static setClearColor(color: glm.vec4) {
		Surface.gl.clearColor(color[0], color[1], color[2], color[3]);
	}

	/** Clear the OpenGL buffers. */
	public static clear() {
		Surface.gl.clear(Surface.gl.COLOR_BUFFER_BIT | Surface.gl.DEPTH_BUFFER_BIT);
	}

	/** 
	 * OpenGL draw elements
	 * @param {VertexArray} vertexArray The vertex array.
	 * @param {number} [mode=TRIANGLES] The mode.
	 */
	public static drawElements(vertexArray: VertexArray, mode: number = Surface.gl.TRIANGLES) {
		Surface.gl.drawElements(mode, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	/**
	 * OpenGL draw elements instanced
	 * @param {VertexArray} vertexArray The vertex array.
	 * @param {number} instanceCount The number of instances to render.
	 * @param {number} mode The OpenGL mode.
	 * @param {number} offset The offset.
	 */
	public static drawElementsInstanced(vertexArray: VertexArray, instanceCount: number, mode: number = Surface.gl.TRIANGLES, offset: number = 0) {
		Surface.gl.drawElementsInstanced(mode, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, offset, instanceCount);
	}

	/**
	 * OpenGL draw arrays.
	 * @param {number} count The number of vertices.
	 * @param {number} [mode=POINTS] The OpenGL mode.
	 */
	public static drawArrays(count: number, mode: number = Surface.gl.POINTS) {
		Surface.gl.drawArrays(mode, 0, count);
	}

	/**
	 * OpenGL draw arrays instanced.
	 * @param {number} count The count.
	 * @param {number} instanceCount The number of instances to draw.
	 * @param {number} [mode=TRIANGLES] The OpenGL mode.
	 */
	public static drawArraysInstanced(count: number, instanceCount: number, mode: number = Surface.gl.TRIANGLES) {
		Surface.gl.drawArraysInstanced(mode, 0, count, instanceCount);
	}
}
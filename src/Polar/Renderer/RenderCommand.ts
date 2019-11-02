import * as glm from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { VertexArray } from 'Polar/Renderer/VertexArray';

export class RenderCommand {
	public static init() {
		Surface.gl.enable(Surface.gl.BLEND);
		Surface.gl.enable(Surface.gl.DEPTH_TEST);
		Surface.gl.blendFunc(Surface.gl.SRC_ALPHA, Surface.gl.ONE_MINUS_SRC_ALPHA);
	}

	public static setClearColor(color: glm.vec4) {
		Surface.gl.clearColor(color[0], color[1], color[2], color[3]);
	}

	public static clear() {
		Surface.gl.clear(Surface.gl.COLOR_BUFFER_BIT | Surface.gl.DEPTH_BUFFER_BIT);
	}

	public static drawElements(vertexArray: VertexArray, mode: number = Surface.gl.TRIANGLES) {
		Surface.gl.drawElements(mode, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	public static drawElementsInstanced(vertexArray: VertexArray, instanceCount: number, mode: number = Surface.gl.TRIANGLES, offset: number = 0) {
		Surface.gl.drawElementsInstanced(mode, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, offset, instanceCount);
	}

	public static drawArrays(count: number, mode: number = Surface.gl.POINTS) {
		Surface.gl.drawArrays(mode, 0, count);
	}

	public static drawArraysInstanced(count: number, instanceCount: number, mode: number = Surface.gl.TRIANGLES) {
		Surface.gl.drawArraysInstanced(mode, 0, count, instanceCount);
	}
}
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

	public static drawIndexed(vertexArray: VertexArray) {
		Surface.gl.drawElements(Surface.gl.TRIANGLES, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	public static drawIndexedLines(vertexArray: VertexArray) {
		Surface.gl.drawElements(Surface.gl.LINES, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	public static drawIndexedLineStrip(vertexArray: VertexArray) {
		Surface.gl.drawElements(Surface.gl.LINE_STRIP, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	public static drawIndexedLineLoop(vertexArray: VertexArray) {
		Surface.gl.drawElements(Surface.gl.LINE_LOOP, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}

	public static drawArrays(count: number, mode: number = Surface.gl.POINTS) {
		Surface.gl.drawArrays(mode, 0, count);
	}
}
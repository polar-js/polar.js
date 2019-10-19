import * as glMatrix from 'gl-matrix';
import { Surface } from 'Polar/Renderer/Surface';
import { VertexArray } from 'Polar/Renderer/VertexArray';

export class RenderCommand {
	public static init(): void {
		Surface.gl.enable(Surface.gl.BLEND);
		Surface.gl.blendFunc(Surface.gl.SRC_ALPHA, Surface.gl.ONE_MINUS_SRC_ALPHA);
	}

	public static setClearColor(color: glMatrix.vec4): void {
		Surface.gl.clearColor(color[0], color[1], color[2], color[3]);
	}

	public static clear(): void {
		Surface.gl.clear(Surface.gl.COLOR_BUFFER_BIT | Surface.gl.DEPTH_BUFFER_BIT);
	}

	public static drawIndexed(vertexArray: VertexArray): void {
		Surface.gl.drawElements(Surface.gl.TRIANGLES, vertexArray.getIndexBuffer().getCount(), Surface.gl.UNSIGNED_SHORT, 0);
	}
}
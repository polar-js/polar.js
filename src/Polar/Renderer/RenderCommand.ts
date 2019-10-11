import * as glMatrix from 'gl-matrix';
import Canvas from 'Polar/Renderer/Canvas';
import VertexArray from 'Polar/Renderer/VertexArray';

class RenderCommand {
	public static init(): void {
		Canvas.gl.enable(Canvas.gl.BLEND);
		Canvas.gl.blendFunc(Canvas.gl.SRC_ALPHA, Canvas.gl.ONE_MINUS_SRC_ALPHA);
	}

	public static setClearColor(color: glMatrix.vec4): void {
		Canvas.gl.clearColor(color[0], color[1], color[2], color[3]);
	}

	public static clear(): void {
		Canvas.gl.clear(Canvas.gl.COLOR_BUFFER_BIT | Canvas.gl.DEPTH_BUFFER_BIT);
	}

	public static drawIndexed(vertexArray: VertexArray): void {
		Canvas.gl.drawElements(Canvas.gl.TRIANGLES, vertexArray.getIndexBuffer().getCount(), Canvas.gl.UNSIGNED_SHORT, 0);
	}
}

export default RenderCommand;
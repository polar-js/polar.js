import { Surface } from 'Polar/Renderer/Surface';

export class RenderBuffer {

	private renderbuffer: WebGLRenderbuffer;

	public constructor() {
		this.renderbuffer = Surface.gl.createRenderbuffer();
	}

	public bind(target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, this.renderbuffer);
	}

	public unbind(target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, null);
	}

	public storage(width: number, height: number, internalFormat = Surface.gl.DEPTH24_STENCIL8, target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, this.renderbuffer);
		Surface.gl.renderbufferStorage(target, internalFormat, width, height);
	}

	public getGLRenderbuffer(): WebGLRenderbuffer {
		return this.renderbuffer;
	}
}
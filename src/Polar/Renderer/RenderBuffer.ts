import { Surface } from 'Polar/Renderer/Surface';

/** Represents an OpenGL renderbuffer. */
export class RenderBuffer {

	private renderbuffer: WebGLRenderbuffer;

	/** Create a new renderbuffer. */
	public constructor() {
		this.renderbuffer = Surface.gl.createRenderbuffer();
	}

	/** Bind the OpenGL renderbuffer
	 * @param {number} [target=RENDERBUFFER] The OpenGL target.
	 */
	public bind(target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, this.renderbuffer);
	}

	/**
	 * Unbind the OpenGL renderbuffer.
	 * @param {number} [target=RENDERBUFFER] The OpenGL target.
	 */
	public unbind(target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, null);
	}

	/**
	 * Set the renderbuffer's storage.
	 * @param {number} width The storage width.
	 * @param {number} height The storage height.
	 * @param {number} [internalFormat=DEPTH24_STENCIL8] The OpenGL internal format.
	 * @param {number} [target=RENDERBUFFER] The OpenGL target.
	 */
	public storage(width: number, height: number, internalFormat = Surface.gl.DEPTH24_STENCIL8, target: number = Surface.gl.RENDERBUFFER) {
		Surface.gl.bindRenderbuffer(target, this.renderbuffer);
		Surface.gl.renderbufferStorage(target, internalFormat, width, height);
	}

	/** Get the OpenGL renderbuffer.
	 * @returns {WebGLRenderbuffer} The renderbuffer.
	 */
	public getGLRenderbuffer(): WebGLRenderbuffer {
		return this.renderbuffer;
	}
}
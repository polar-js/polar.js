import { Surface } from './Surface';

/** Represents an OpenGL renderbuffer. */
export class RenderBuffer {

	private renderbuffer: WebGLRenderbuffer;

	private width: number;
	private height: number;
	private internalFormat: number;
	private target: number;

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
		this.width = width;
		this.height = height;
		this.internalFormat = internalFormat;
		this.target = target;
	}

	/** Get the OpenGL renderbuffer.
	 * @returns {WebGLRenderbuffer} The renderbuffer.
	 */
	public getGLRenderbuffer(): WebGLRenderbuffer {
		return this.renderbuffer;
	}

	public resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		Surface.gl.deleteRenderbuffer(this.renderbuffer);
		this.renderbuffer = Surface.gl.createRenderbuffer();
		Surface.gl.bindRenderbuffer(this.target, this.renderbuffer);
		Surface.gl.renderbufferStorage(this.target, this.internalFormat, this.width, this.height);
	}
}
import c from './Canvas';

/** Represents a 2D OpenGL Texture */
export default class Texture2D {
	private path: string;
	private width: number;
	private height: number;
	private texture: WebGLTexture;

	private loaded: boolean;

	/**
	 * Create a texture.
	 * @param {string} [path] The path of the texture image file.
	 */
	public constructor() {
		this.loaded = false;

		this.texture = c.gl.createTexture();
		c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
		// Fill texture with a 1x1 sample pixel.
		c.gl.texImage2D(c.gl.TEXTURE_2D, 0, c.gl.RGBA, 1, 1, 0, c.gl.RGBA, c.gl.UNSIGNED_BYTE, new Uint8Array([25, 25, 25, 255]));
		// Set texture parameters.
		c.gl.texParameteri(c.gl.TEXTURE_2D, c.gl.TEXTURE_MIN_FILTER, c.gl.LINEAR);
		c.gl.texParameteri(c.gl.TEXTURE_2D, c.gl.TEXTURE_MAG_FILTER, c.gl.NEAREST);
	}

	public loadFromPath(path: string) {
		this.path = path;
		
		if(path) {
			const image = new Image();
			image.src = this.path;
			image.addEventListener('load', () => {
				c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
				c.gl.texImage2D(c.gl.TEXTURE_2D, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, image);
				c.gl.generateMipmap(c.gl.TEXTURE_2D);
				this.loaded = true;
				this.width = image.clientWidth;
				this.height = image.clientHeight;
			});
		}
	}

	public loadFromArray(pixels: Uint8Array, width: number, height: number) {
		c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
		c.gl.texImage2D(c.gl.TEXTURE_2D, 0, c.gl.RGBA, width, height, 0, c.gl.RGBA, c.gl.UNSIGNED_BYTE, pixels);

		this.loaded = true;
	}

	/**
	 * Get the texture's width.
	 * @returns {number} The texture's width.
	 */
	public getWidth(): number {
		return this.width;
	}

	/**
	 * Get the texture's height.
	 * @returns {number} The texture's height.
	 */
	public getHeight(): number {
		return this.height;
	}

	/** Bind the texture */
	public bind() {
		c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
	}

	/**
	 * Test if the texture has been loaded.
	 * @returns {boolean} Whether the texture has been loaded.
	 */
	public isLoaded(): boolean {
		return this.loaded;
	}

}
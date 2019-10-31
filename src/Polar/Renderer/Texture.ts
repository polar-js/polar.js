import { Surface as s } from './Surface';

/** Represents a 2D OpenGL Texture */
export  class Texture2D {
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

		this.texture = s.gl.createTexture();
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
		// Fill texture with a 1x1 sample pixel.
		s.gl.texImage2D(s.gl.TEXTURE_2D, 0, s.gl.RGBA, 1, 1, 0, s.gl.RGBA, s.gl.UNSIGNED_BYTE, new Uint8Array([25, 25, 25, 255]));
		// Set texture parameters.
		s.gl.texParameteri(s.gl.TEXTURE_2D, s.gl.TEXTURE_MIN_FILTER, s.gl.LINEAR);
		s.gl.texParameteri(s.gl.TEXTURE_2D, s.gl.TEXTURE_MAG_FILTER, s.gl.NEAREST);
	}

	public loadFromPath(path: string) {
		this.path = path;
		
		if(path) {
			const image = new Image();
			image.src = this.path;
			image.addEventListener('load', () => {
				s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
				s.gl.texImage2D(s.gl.TEXTURE_2D, 0, s.gl.RGBA, s.gl.RGBA, s.gl.UNSIGNED_BYTE, image);
				s.gl.generateMipmap(s.gl.TEXTURE_2D);
				this.loaded = true;
				this.width = image.clientWidth;
				this.height = image.clientHeight;
			});
		}
	}

	public loadFromArray(pixels: Uint8Array, width: number, height: number) {
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
		s.gl.texImage2D(s.gl.TEXTURE_2D, 0, s.gl.RGBA, width, height, 0, s.gl.RGBA, s.gl.UNSIGNED_BYTE, pixels);

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
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
	}

	/**
	 * Test if the texture has been loaded.
	 * @returns {boolean} Whether the texture has been loaded.
	 */
	public isLoaded(): boolean {
		return this.loaded;
	}

}
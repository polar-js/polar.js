import { Surface as s } from './Surface';

/** Represents a 2D OpenGL Texture */
export class Texture2D {
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

	/**
	 * Load an image into the texture through a HTMLImageElement.
	 * @param {HTMLImageElement} image The image to be loaded.
	 */
	public loadFromImage(image: HTMLImageElement) {
		this.path = image.src;
		if (image.complete) {
			this.createTexture(image);
		}
		else {
			image.addEventListener('load', () => {
				this.createTexture(image);
			});
		}
	}

	/**
	 * Load an image into the texture through a path.
	 * @param {string} path The path of the image.
	 */
	public loadFromPath(path: string) {
		this.path = path;
		
		if(path) {
			const image = new Image();
			image.src = this.path;
			image.addEventListener('load', () => {
				this.createTexture(image);
			});
		}
	}

	/**
	 * Load an array of pixels into the texture.
	 * @param {Uint8Array} pixels Array of pixel data to be inputted.
	 * @param {number} width The width of the texture in pixels.
	 * @param {number} height The height of the texture in pixels.
	 * @param {number} [internalFormat=gl.RGBA] The OpenGL internal format.
	 * @param {number} [format=gl.RGBA] The OpenGL format.
	 */
	public loadFromArray(pixels: Uint8Array, width: number, height: number, internalFormat: number = s.gl.RGBA, format: number = s.gl.RGBA) {
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
		s.gl.texImage2D(s.gl.TEXTURE_2D, 0, internalFormat , width, height, 0, format, s.gl.UNSIGNED_BYTE, pixels);
		this.width = width;
		this.height = height;
		this.loaded = true;
	}

	/**
	 * Load an empty texture of specified width and height.
	 * @param {number} width The width of the texture in pixels.
	 * @param {number} height The height of the texture in pixels.
	 * @param {number} [internalFormat=gl.RGBA] The OpenGL internal format.
	 * @param {number} [format=gl.RGBA] The OpenGL format.
	 */
	public loadEmpty(width: number, height: number, internalFormat: number = s.gl.RGBA, format: number = s.gl.RGBA) {
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
		s.gl.texImage2D(s.gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, s.gl.UNSIGNED_BYTE, null);
		this.width = width;
		this.height = height;
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

	/** Bind the texture 
	 * @param {number} [slot=gl.TEXTURE0] The texture number.
	*/
	public bind(slot: number = s.gl.TEXTURE0) {
		s.gl.activeTexture(slot);
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
	}

	public unbind() {
		s.gl.bindTexture(s.gl.TEXTURE_2D, null);
	}

	/**
	 * Test if the texture has been loaded.
	 * @returns {boolean} Whether the texture has been loaded.
	 */
	public isLoaded(): boolean {
		return this.loaded;
	}

	/**
	 * Get the OpenGL texture.
	 * @returns {WebGLTexture}
	 */
	public getGLTexture(): WebGLTexture {
		return this.texture;
	}

	/**
	 * Create a new texture from an image element.
	 * @param {HTMLImageElement} image The image.
	 */
	private createTexture(image: HTMLImageElement) {
		s.gl.bindTexture(s.gl.TEXTURE_2D, this.texture);
		s.gl.texImage2D(s.gl.TEXTURE_2D, 0, s.gl.RGBA, s.gl.RGBA, s.gl.UNSIGNED_BYTE, image);
		s.gl.generateMipmap(s.gl.TEXTURE_2D);
		this.loaded = true;
		this.width = image.width;
		this.height = image.height;
	}
}
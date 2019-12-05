import { Texture2D } from 'Polar/Renderer/Texture';
import { Surface } from 'Polar/Renderer/Surface';

/** Stores a number of textures accessible through aliases. */
export class TextureLibrary {
	
	private textures: Map<string, Texture2D>;

	/** Create a new TextureLibrary */
	public constructor() {
		this.textures = new Map<string, Texture2D>();
	}

	public get(alias: string): Texture2D {
		return this.textures.get(alias);
	}

	public set(alias: string, texture: Texture2D) {
		this.textures.set(alias, texture);
	}

	/**
	 * Load a single texture into the texture library through an image.
	 * @param {string} alias The alias used to access texture.
	 * @param {HTMLImageElement} image The image to be loaded into the texture.
	 */
	public loadFromImage(alias: string, image: HTMLImageElement) {
		let texture = new Texture2D();
		texture.loadFromImage(image);
		this.textures.set(alias, texture);
	}

	/**
	 * Load many textures into the library through an image.
	 * @param {[string, HTMLImageElement][]} data Array of alias/image pairs to be loaded into the library.
	 */
	public loadManyFromImage(data: [string, HTMLImageElement][]) {
		for (let [alias, image] of data) {
			this.loadFromImage(alias, image);
		}
	}

	/**
	 * Load a single texture into the texture library through a path.
	 * @param alias The alias used to access texture.
	 * @param path The path of an image to be loaded.
	 */
	public loadFromPath(alias: string, path: string) {
		let texture = new Texture2D();
		texture.loadFromPath(path);
		this.textures.set(alias, texture);
	}

	/**
	 * Load many textures into the library through a path.
	 * @param {[string, string][]} data Array of alias/path pairs to be loaded into the library.
	 */
	public loadManyFromPath(data: [string, string][]) {
		for (let [alias, path] of data) {
			this.loadFromPath(alias, path);
		}
	}

	/**
	 * Load a single texture into the texture library through an array of pixels.
	 * @param {string} alias The alias used to access texture.
	 * @param {Uint8Array} pixels Array of pixel data to be inputted.
	 * @param {number} width The width of the texture in pixels.
	 * @param {number} height The height of the texture in pixels.
	 * @param {number} [internalFormat=gl.RGBA] The OpenGL internal format.
	 * @param {number} [format=gl.RGBA] The OpenGL format.
	 */
	public loadFromArray(alias: string, pixels: Uint8Array, width: number, height: number, internalFormat: number = Surface.gl.RGBA, format: number = Surface.gl.RGBA) {
		let texture = new Texture2D();
		texture.loadFromArray(pixels, width, height, internalFormat, format);
		this.textures.set(alias, texture);
	}

	/**
	 * Load a single empty texture into the texture library.
	 * @param alias The alias used to access texture.
	 * @param {number} width The width of the texture in pixels.
	 * @param {number} height The height of the texture in pixels.
	 * @param {number} [internalFormat=gl.RGBA] The OpenGL internal format.
	 * @param {number} [format=gl.RGBA] The OpenGL format.
	 */
	public loadEmpty(alias: string, width: number, height: number, internalFormat: number = Surface.gl.RGBA, format: number = Surface.gl.RGBA) {
		let texture = new Texture2D();
		texture.loadEmpty(width, height, internalFormat, format);
		this.textures.set(alias, texture);
	}
}
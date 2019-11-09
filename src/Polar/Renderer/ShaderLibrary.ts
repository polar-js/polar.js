import { Shader } from './Shader';

/** Stores a number of shaders. */
export  class ShaderLibrary {
	private shaders: { [id: string]: Shader };

	/** Create a new shader library. */
	public constructor() {
		this.shaders = {};
	}

	/**
	 * Add a shader to be stored in the shader library.
	 * @param {Shader} shader The shader to add.
	 * @param {string} [name] The name used to access the shader (optional).
	 */
	public add(shader: Shader, name?: string) {
		if (!name) {
			name = shader.getName();
		}
		console.assert(!(name in this.shaders), 'Shader already exists!');

		this.shaders[name] = shader;
	}

	public set(shader: Shader, name?: string) {
		if (!name) {
			name = shader.getName();
		}

		this.shaders[name] = shader;
	}

	/**
	 * Load a shader into the ShaderLibrary.
	 * @param {string} filepath The path of the shader to be loaded.
	 * @param {string} [name] The name of the shader used to access it.
	 * @returns {Promise<Shader>} The shader which was loaded.
	 */
	public async load(filepath: string, name: string = null): Promise<Shader> {
		const shader = await Shader.loadFromFetch(filepath, name);
		this.add(shader, name);
		return shader;
	}

	/**
	 * Get a shader from the ShaderLibary.
	 * @param {string} name The name of the shader.
	 * @returns {Shader} The shader.
	 */
	public get(name: string): Shader {
		console.assert(name in this.shaders, 'Shader not found!');
		return this.shaders[name];
	}

	/**
	 * Check if a shader is currently being stored in the ShaderLibrary.
	 * @param {string} name The name of the shader.
	 * @returns {boolean} Whether the shader exists or not.
	 */
	public exists(name: string): boolean {
		return name in this.shaders;
	}
}
import { Canvas } from './Canvas';
import { vec2, vec3, vec4, mat3, mat4 } from 'gl-matrix';

function shaderTypeFromString(type: string): number {
	if (type == 'vertex')
		return Canvas.gl.VERTEX_SHADER;
	if (type == 'fragment' || type == 'pixel')
		return Canvas.gl.FRAGMENT_SHADER;
	
	return null;
}

/** Represents an OpenGL shader. */
export  class Shader {
	private rendererID: WebGLProgram;
	private name: string;
	private locations: { [id: string]: WebGLUniformLocation };

	public constructor(name: string, vertexSrc: string, fragmentSrc: string) {
		this.name = name;
		this.locations = {};

		this.compile({[shaderTypeFromString('vertex')]: vertexSrc, [shaderTypeFromString('fragment')]: fragmentSrc});
	}

	/**
	 * Loads a shader from a file path.
	 * @param {string} filepath The filepath of the shader source code.
	 * @param {string} [name] The name of the shader (Optional). If null, will use the filename.
	 * @returns {Shader} The shader that was loaded from the path.
	 * @static
	 */
	public static async loadFromFetch(filepath: string, name: string = null): Promise<Shader> {
		if (!name) name = filepath.substr(filepath.lastIndexOf('/') + 1);
		const response = await fetch(filepath);
		const source = await response.text();
		const shaderSources = this.preProcess(source);
		return new Shader(name, shaderSources[shaderTypeFromString('vertex')], shaderSources[shaderTypeFromString('fragment')]);
	}
	
	/**
	 * Processes the raw shader source file and returns the individual shaders.
	 * @param {string} source The raw source code.
	 * @returns {{[id: number]: string}} A dictionary of the individual shaders.
	 * @private
	 * @static
	 */
	private static preProcess(source: string): {[id: number]: string} {
		let sources: {[id: number]: string} = {};

		let currentType = '';
		const lines = source.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			const words = line.split(' ');
			if (words.length == 2) {
				if (words[0] == '#type') {
					currentType = words[1];
					sources[shaderTypeFromString(currentType)] = '';
					continue;
				}
			}

			if (currentType == '')
				continue;
			
			sources[shaderTypeFromString(currentType)] += line + '\n';
		}

		return sources;
	}

	/**
	 * Compiles the shader sources into an OpenGL program.
	 * @param {{[id: number]: string}} shaderSources A dictionary containing each shader type and source code.
	 * @private
	 */
	private compile(shaderSources: {[id: number]: string}) {
		let program: WebGLProgram = Canvas.gl.createProgram();
		let shaderIDs: WebGLShader[] = [];
		for (let type in shaderSources) {
			const source = shaderSources[type];

			const shader = Canvas.gl.createShader(Number(type));
			Canvas.gl.shaderSource(shader, source);
			Canvas.gl.compileShader(shader);

			const log = Canvas.gl.getShaderInfoLog(shader);
			if (log != '' && log != null) {
				Canvas.gl.deleteShader(shader);
				console.log(log);
				console.assert(false, 'Shader compilation error!');
				break;
			}

			Canvas.gl.attachShader(program, shader);
			shaderIDs.push(shader);
		}

		Canvas.gl.linkProgram(program);

		const log = Canvas.gl.getProgramInfoLog(program);
		if (log != '' && log != null) {
			Canvas.gl.deleteProgram(program);

			for (const id of shaderIDs) {
				Canvas.gl.deleteShader(id);
			}

			console.log(log);
			console.assert(false, 'Program link failure!');
			return;
		}

		for (const id of shaderIDs) 
			Canvas.gl.detachShader(program, id);
		
		this.rendererID = program;
	}

	/** Binds the shader. */
	public bind(): void {
		Canvas.gl.useProgram(this.rendererID);
	}

	/** Unbinds the shader. */
	public unbind(): void {
		Canvas.gl.useProgram(0);
	}

	/**
	 * Get the shader's name.
	 * @returns {string} The shader's name.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Get the location of an attribute within the shader.
	 * @param {string} name The name of the attribute within the shader.
	 * @returns {number} The location of the attribute.
	 */
	public getAttribLocation(name: string): number {
		return Canvas.gl.getAttribLocation(this.rendererID, name);
	}

	/**
	 * Get the location of a uniform within the shader.
	 * @param {string} name The name of the uniform within the shader.
	 * @returns {WebGLUniformLocation} The location of the uniform.
	 */
	public getUniformLocation(name: string): WebGLUniformLocation {
		if (name in this.locations) {
			return this.locations[name];
		}
		else {
			const location = Canvas.gl.getUniformLocation(this.rendererID, name);
			this.locations[name] = location;
			return location;
		}
	}

	/**
	 * Set an integer uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {number} value The value which the uniform is set to.
	 */
	public uploadUniformInt(name: string, value: number) {
		Canvas.gl.uniform1i(this.getUniformLocation(name), value);
	}

	/**
	 * Set a float uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {number} value The value which the uniform is set to.
	 */
	public uploadUniformFloat(name: string, value: number) {
		Canvas.gl.uniform1f(this.getUniformLocation(name), value);
	}

	/**
	 * Set a vector 2 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {vec2} value The value which the uniform is set to.
	 */
	public uploadUniformFloat2(name: string, value: vec2) {
		Canvas.gl.uniform2f(this.getUniformLocation(name), value[0], value[1]);
	}

	/**
	 * Set a vector 3 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {vec3} value The value which the uniform is set to.
	 */
	public uploadUniformFloat3(name: string, value: vec3) {
		Canvas.gl.uniform3f(this.getUniformLocation(name), value[0], value[1], value[2]);
	}

	/**
	 * Set a vector 4 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {vec4} value The value which the uniform is set to.
	 */
	public uploadUniformFloat4(name: string, value: vec4) {
		Canvas.gl.uniform4f(this.getUniformLocation(name), value[0], value[1], value[2], value[3]);
	}

	/**
	 * Set a 3x3 matrix uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {mat3} value The value which the uniform is set to.
	 */
	public uploadUniformMat3(name: string, value: mat3) {
		Canvas.gl.uniformMatrix3fv(this.getUniformLocation(name), false, value);
	}

	/**
	 * Set a 4x4 matrix uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {mat4} value The value which the uniform is set to.
	 */
	public uploadUniformMat4(name: string, value: mat4) {
		Canvas.gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
	}
}
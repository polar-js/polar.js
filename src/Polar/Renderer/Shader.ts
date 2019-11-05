import { Surface } from './Surface';
import * as glm from 'gl-matrix';

function shaderTypeFromString(type: string): number {
	if (type == 'vertex')
		return Surface.gl.VERTEX_SHADER;
	if (type == 'fragment' || type == 'pixel')
		return Surface.gl.FRAGMENT_SHADER;
	
	return null;
}

/** Represents an OpenGL shader. */
export  class Shader {
	private program: WebGLProgram;
	private name: string;
	private locations: { [id: string]: WebGLUniformLocation };

	public constructor(name: string, vertexSrc: string, fragmentSrc: string, transformFeedbackVaryings?: string[]) {
		this.name = name;
		this.locations = {};

		this.compile({[shaderTypeFromString('vertex')]: vertexSrc, [shaderTypeFromString('fragment')]: fragmentSrc}, transformFeedbackVaryings);
	}

	/**
	 * Loads a shader from a file path.
	 * @param {string} path The file path of the shader source code.
	 * @param {string} [name] The name of the shader (Optional). If null, will use the filename.
	 * @returns {Shader} The shader that was loaded from the path.
	 * @static
	 */
	public static async loadFromFetch(path: string, name: string = null): Promise<Shader> {
		if (!name) name = path.substr(path.lastIndexOf('/') + 1);
		const response = await fetch(path);
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
	private compile(shaderSources: {[id: number]: string}, transformFeedbackVaryings?: string[]) {
		let program: WebGLProgram = Surface.gl.createProgram();
		let shaders: WebGLShader[] = [];
		for (let type in shaderSources) {
			const source = shaderSources[type];

			const shader = Surface.gl.createShader(Number(type));
			Surface.gl.shaderSource(shader, source);
			Surface.gl.compileShader(shader);

			const log = Surface.gl.getShaderInfoLog(shader);
			if (log != '' && log != null) {
				Surface.gl.deleteShader(shader);
				console.log(log);
				console.assert(false, 'Shader compilation error!');
				break;
			}

			Surface.gl.attachShader(program, shader);
			shaders.push(shader);
		}

		// SUBMIT TRANSFORM FEEDBACK 
		if (transformFeedbackVaryings) {
			Surface.gl.transformFeedbackVaryings(program, transformFeedbackVaryings, Surface.gl.INTERLEAVED_ATTRIBS);
		}

		Surface.gl.linkProgram(program);

		// LOG ERRORS //
		if (!Surface.gl.getProgramParameter(program, Surface.gl.LINK_STATUS)) {
			const log = Surface.gl.getProgramInfoLog(program);
			if (log != '' && log != null) {
				Surface.gl.deleteProgram(program);

				for (const shader of shaders) {
					Surface.gl.deleteShader(shader);
				}

				console.log(log);
				console.assert(false, 'Program link failure!');
				return;
			}
		}

		// DETACH AND DELETE SHADERS //
		for (const id of shaders) {
			Surface.gl.detachShader(program, id);
			Surface.gl.deleteShader(id);
		}
		
		this.program = program;
	}

	/** Binds the shader. */
	public bind(): void {
		Surface.gl.useProgram(this.program);
	}

	/** Unbinds the shader. */
	public unbind(): void {
		Surface.gl.useProgram(null);
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
		return Surface.gl.getAttribLocation(this.program, name);
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
			const location = Surface.gl.getUniformLocation(this.program, name);
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
		Surface.gl.uniform1i(this.getUniformLocation(name), value);
	}

	/**
	 * Set a float uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {number} value The value which the uniform is set to.
	 */
	public uploadUniformFloat(name: string, value: number) {
		Surface.gl.uniform1f(this.getUniformLocation(name), value);
	}

	/**
	 * Set a vector 2 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {glm.vec2} value The value which the uniform is set to.
	 */
	public uploadUniformFloat2(name: string, value: glm.vec2) {
		Surface.gl.uniform2f(this.getUniformLocation(name), value[0], value[1]);
	}

	/**
	 * Set a vector 3 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {glm.vec3} value The value which the uniform is set to.
	 */
	public uploadUniformFloat3(name: string, value: glm.vec3) {
		Surface.gl.uniform3f(this.getUniformLocation(name), value[0], value[1], value[2]);
	}

	/**
	 * Set a vector 4 uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {glm.vec4} value The value which the uniform is set to.
	 */
	public uploadUniformFloat4(name: string, value: glm.vec4) {
		Surface.gl.uniform4f(this.getUniformLocation(name), value[0], value[1], value[2], value[3]);
	}

	/**
	 * Set a 3x3 matrix uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {glm.mat3} value The value which the uniform is set to.
	 */
	public uploadUniformMat3(name: string, value: glm.mat3) {
		Surface.gl.uniformMatrix3fv(this.getUniformLocation(name), false, value);
	}

	/**
	 * Set a 4x4 matrix uniform's value.
	 * @param {string} name The name of the uniform variable.
	 * @param {glm.mat4} value The value which the uniform is set to.
	 */
	public uploadUniformMat4(name: string, value: glm.mat4) {
		Surface.gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
	}
}
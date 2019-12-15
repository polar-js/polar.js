import { ShaderDataType, BufferLayout, VertexBuffer, IndexBuffer } from './Buffer';
import { Surface } from './Surface';
import { Shader }  from './Shader';

/**
 * Get the OpenGL base type from a shader data type.
 * @param {ShaderDataType} type The shader data type.
 * @returns {number} The OpenGL enum.
 * @internal
 */
function shaderDataTypeToOpenGLBaseType(type: ShaderDataType): number {
	switch (type) {
	case ShaderDataType.Float:  return Surface.gl.FLOAT;
	case ShaderDataType.Float2: return Surface.gl.FLOAT;
	case ShaderDataType.Float3: return Surface.gl.FLOAT;
	case ShaderDataType.Float4: return Surface.gl.FLOAT;
	case ShaderDataType.Mat3:   return Surface.gl.FLOAT;
	case ShaderDataType.Mat4:   return Surface.gl.FLOAT;
	case ShaderDataType.Int:    return Surface.gl.INT;
	case ShaderDataType.Int2:   return Surface.gl.INT;
	case ShaderDataType.Int3:   return Surface.gl.INT;
	case ShaderDataType.Int4:   return Surface.gl.INT;
	case ShaderDataType.Bool:   return Surface.gl.BOOL;
	}
	console.assert(false, 'Unknown ShaderDataType!');
	return 0;
}

/** Represents an OpenGL vertex array. */
export class VertexArray {
	private vertexArray: WebGLVertexArrayObject;
	private vertexBuffers: VertexBuffer[];
	private indexBuffer: IndexBuffer;

	/** Create a new vertex array. */
	public constructor () {
		this.vertexArray = Surface.gl.createVertexArray();
		this.vertexBuffers = [];
	}

	/** Bind the vertex array in OpenGL. */
	public bind() {
		Surface.gl.bindVertexArray(this.vertexArray);
	}

	/** Unbind the vertex array in OpenGL. */
	public unbind() {
		Surface.gl.bindVertexArray(null);
	}

	/**
	 * Add a vertex buffer to the array.
	 * @param {VertexBuffer} vertexBuffer The vertex buffer.
	 * @param {Shader} shader The shader.
	 */
	public addVertexBuffer(vertexBuffer: VertexBuffer, shader: Shader) {
		console.assert(vertexBuffer.getLayout().getElements().length != 0, 'Vertex Buffer has no layout!');

		shader.bind();
		Surface.gl.bindVertexArray(this.vertexArray);
		vertexBuffer.bind();

		const layout: BufferLayout = vertexBuffer.getLayout();
		for (const element of layout.getElements()) {
			let location;
			if (element.location < 0) {
				location = shader.getAttribLocation(element.name);
				if (location < 0){
					console.error(`Attribute '${element.name}' not found in shader '${shader.getName()}'.`);
				}
			}
			else {
				location = element.location;
			}
			
			if (element.type === ShaderDataType.Mat4) {
				for (let i = 0; i < 4; i++) {
					const loc = location + i;
					const size = element.getComponentCount() / 4;
					const type = shaderDataTypeToOpenGLBaseType(element.type);
					const stride = layout.getStride();
					const offset = element.offset + 16 * i;

					Surface.gl.enableVertexAttribArray(loc);
					Surface.gl.vertexAttribPointer(loc, size, type, element.normalized, stride, offset);
	
					if (element.divisor >= 0) {
						Surface.gl.vertexAttribDivisor(location + i, element.divisor);
					}
				}
			}
			else {
				Surface.gl.enableVertexAttribArray(location);
				Surface.gl.vertexAttribPointer(location, 
					element.getComponentCount(), 
					shaderDataTypeToOpenGLBaseType(element.type),
					element.normalized, 
					layout.getStride(),
					element.offset);
	
				if (element.divisor >= 0) {
					Surface.gl.vertexAttribDivisor(location, element.divisor);
				}
			}
		}
		shader.unbind();
		this.vertexBuffers.push(vertexBuffer);
	}

	/**
	 * Set the vertex array's index buffer.
	 * @param {IndexBuffer} indexBuffer The index buffer.
	 */
	public setIndexBuffer(indexBuffer: IndexBuffer) {
		Surface.gl.bindVertexArray(this.vertexArray);
		indexBuffer.bind();

		this.indexBuffer = indexBuffer;
	}

	/**
	 * Get the vertex buffers.
	 * @returns {VertexBuffer[]} The vertex buffers.
	 */
	public getVertexBuffers(): VertexBuffer[] {
		return this.vertexBuffers;
	}

	/**
	 * Get the index buffer
	 * @returns {IndexBuffer} The index buffer.
	 */
	public getIndexBuffer(): IndexBuffer {
		return this.indexBuffer;
	}
}
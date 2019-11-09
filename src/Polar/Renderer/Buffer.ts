import { Surface } from './Surface';

/** Enum which represents the possible shader data types. */
export enum ShaderDataType {
	None = 0, Float, Float2, Float3, Float4, Mat3, Mat4, Int, Int2, Int3, Int4, Bool
}

/** Get the size of a shader data type.
 * @param {ShaderDataType} type The type.
 * @returns {number} The size.
 */
export function shaderDataTypeSizes(type: ShaderDataType): number {
	switch (type) {
	case ShaderDataType.Float:  return 4;
	case ShaderDataType.Float2: return 4 * 2;
	case ShaderDataType.Float3: return 4 * 3;
	case ShaderDataType.Float4: return 4 * 4;
	case ShaderDataType.Mat3:   return 4 * 3 * 3;
	case ShaderDataType.Mat4:   return 4 * 4 * 4;
	case ShaderDataType.Int:    return 4;
	case ShaderDataType.Int2:   return 4 * 2;
	case ShaderDataType.Int3:   return 4 * 3;
	case ShaderDataType.Int4:   return 4 * 4;
	case ShaderDataType.Bool:   return 1;
	}
}

/** Represents a buffer element within a layout. */
export class BufferElement
{
	/** The attribute name
	 * @type {string}
	 */
	public name: string;
	/** The attribute type
	 * @type {ShaderDataType}
	 */
	public type: ShaderDataType;
	/** The attribute size
	 * @type {number}
	 */
	public size: number;
	/** The attribute offset
	 *  @type {number}
	 */
	public offset: number;
	/** Whether the attribute is normalized
	 *  @type {boolean}
	 */
	public normalized: boolean;
	/** The attribute divisor
	 * @type {number}
	 */
	public divisor: number;
	/** The attribute location
	 * @type {number}
	 */
	public location: number;

	/** Create a new buffer element
	 * @param {ShaderDataType} type The data type.
	 * @param {string} name The attribute name.
	 * @param {boolean} [normalized=false]
	 */
	public constructor(type: ShaderDataType, name: string, normalized: boolean = false, divisor: number = -1, location: number = -1) {
		this.type = type;
		this.name = name;
		this.size = shaderDataTypeSizes(type);
		this.offset = 0;
		this.normalized = normalized;
		this.divisor = divisor;
		this.location = location;
	}

	/** Get the element's component count.
	 * @returns {number}
	 */
	public getComponentCount(): number {
		switch (this.type) {
		case ShaderDataType.Float:  return 1;
		case ShaderDataType.Float2: return 2;
		case ShaderDataType.Float3: return 3;
		case ShaderDataType.Float4: return 4;
		case ShaderDataType.Mat3:   return 3 * 3;
		case ShaderDataType.Mat4:   return 4 * 4;
		case ShaderDataType.Int:    return 1;
		case ShaderDataType.Int2:   return 2;
		case ShaderDataType.Int3:   return 3;
		case ShaderDataType.Int4:   return 4;
		case ShaderDataType.Bool:   return 1;
		}

		console.assert(false, 'Unknown ShaderDataType!');
		return 0;
	}
}

/** Represents the layout of a buffer. */
export class BufferLayout {
	private elements: BufferElement[];
	private stride: number = 0;

	/** Create a new buffer element.
	 * @param {BufferElement[]} elements The elements.
	 */
	public constructor(elements: BufferElement[]) {
		this.elements = elements;
		let offset = 0;
		this.stride = 0;

		for (let element of elements) {
			element.offset = offset;
			offset += element.size;
			this.stride += element.size;
		}
	}

	/** Get the stride.
	 * @returns {number} The stride.
	 */
	public getStride(): number {
		return this.stride;
	}

	/** Get elements.
	 * @returns {BufferElement[]}
	 */
	public getElements(): BufferElement[] {
		return this.elements;
	}

	/** Get the total number of components.
	 * @returns {number} The components.
	 */
	public getComponentCount(): number {
		let count = 0;
		for (let element of this.elements) {
			count += element.getComponentCount();
		}
		return count;
	}
}

/** Represents an OpenGL vertex buffer. */
export class VertexBuffer {
	private buffer: WebGLBuffer;
	private layout: BufferLayout;

	/** Create a new vertex buffer.
	 * @param {Float32Array} vertices The vertices.
	 * @param {number} [usage=Surface.gl.STATIC_DRAW] The usage.
	 * @param {number} [length] The length of the buffer.
	 */
	public constructor (vertices?: Float32Array, usage: number = Surface.gl.STATIC_DRAW, length?: number) {
		this.buffer = Surface.gl.createBuffer();
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, this.buffer);
		if (length)
			Surface.gl.bufferData(Surface.gl.ARRAY_BUFFER, vertices, usage);
		else
			Surface.gl.bufferData(Surface.gl.ARRAY_BUFFER, vertices, usage, 0, length);
	}

	/** Bind the OpenGL buffer. */
	public bind() {
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, this.buffer);
	}

	/** Unbind the OpenGL buffer. */
	public unbind() {
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, null);
	}

	/** Get layout.
	 * @return {BufferLayout} The layout.
	 */
	public getLayout(): BufferLayout {
		return this.layout;
	}

	/** Set layout.
	 * @param {BufferLayout} layout The new layout.
	 */
	public setLayout(layout: BufferLayout) {
		this.layout = layout;
	}

	/** OpenGL bind buffer base.
	 * @param {number} [target=TRANSFORM_FEEDBACK_BUFFER] The target.
	 * @param {number} [index=0] The index.
	 */
	public bindBufferBase(target: number = Surface.gl.TRANSFORM_FEEDBACK_BUFFER, index: number = 0) {
		Surface.gl.bindBufferBase(target, index, this.buffer);
	}

	/** OpenGL unbind buffer base.
	 * @param {number} target The OpenGL target.
	 * @param {number} index The index.
	 */
	public unbindBufferBase(target: number = Surface.gl.TRANSFORM_FEEDBACK_BUFFER, index: number = 0) {
		Surface.gl.bindBufferBase(target , index, null);
	}

	/** Set the buffer data.
	 * @param {Float32Array} data The data.
	 * @param {number} [usage=STATIC_DRAW] The OpenGL usage.
	 * @param {number} [target=ARRAY_BUFFER] The OpenGL target.
	 */
	public setData(data: Float32Array, usage: number = Surface.gl.STATIC_DRAW, target: number = Surface.gl.ARRAY_BUFFER) {
		Surface.gl.bindBuffer(target, this.buffer);
		Surface.gl.bufferData(target, data, usage);
	}

	/** Set buffer sub data.
	 * @param {Float32Array} data The data.
	 * @param {number} offset The offset into the buffer.
	 * @param {number} [target=ARRAY_BUFFER] The OpenGL target.
	 */
	public setSubData(data: Float32Array, offset: number, target: number = Surface.gl.ARRAY_BUFFER) {
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, this.buffer);
		Surface.gl.bufferSubData(target, offset, data);
	}
}

/** Represents an OpenGL index buffer. */
export class IndexBuffer {
	private buffer: WebGLBuffer;
	private count: number;

	/** Create a new index buffer.
	 * @param {Uint16Array} indices The indices.
	 */
	public constructor (indices: Uint16Array) {
		this.buffer = Surface.gl.createBuffer();
		this.count = indices.length;
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
		Surface.gl.bufferData(Surface.gl.ELEMENT_ARRAY_BUFFER, indices, Surface.gl.STATIC_DRAW);
	}

	/** Bind the index buffer in OpenGL. */
	public bind() {
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
	}

	/** Unbind the index buffer in OpenGL. */
	public unbind() {
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, null);
	}

	/** Get the number of indices.
	 * @returns {number} The number of indices.
	 */
	public getCount(): number {
		return this.count;
	}
}
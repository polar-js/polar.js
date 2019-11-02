import { Surface } from './Surface';

export enum ShaderDataType {
	None = 0, Float, Float2, Float3, Float4, Mat3, Mat4, Int, Int2, Int3, Int4, Bool
}

export function shaderDataTypeSizes(type: ShaderDataType): number {
	switch (type) {
	case ShaderDataType.Float:  return 4;
	case ShaderDataType.Float2: return 4 * 2;
	case ShaderDataType.Float3: return 4 * 3;
	case ShaderDataType.Float4: return 4 * 4;
	case ShaderDataType.Mat3:   return 4 * 3 * 3;
	case ShaderDataType.Mat4:   return 4 * 3 * 4;
	case ShaderDataType.Int:    return 4;
	case ShaderDataType.Int2:   return 4 * 2;
	case ShaderDataType.Int3:   return 4 * 3;
	case ShaderDataType.Int4:   return 4 * 4;
	case ShaderDataType.Bool:   return 1;
	}
}

export class BufferElement
{
	public name: string;
	public type: ShaderDataType;
	public size: number;
	public offset: number;
	public normalized: boolean;
	public divisor: number;

	public constructor(type: ShaderDataType, name: string, normalized: boolean = false, divisor: number = -1) {
		this.type = type;
		this.name = name;
		this.size = shaderDataTypeSizes(type);
		this.offset = 0;
		this.normalized = normalized;
		this.divisor = divisor;
	}

	public getComponentCount(): number {
		switch (this.type) {
		case ShaderDataType.Float:  return 1;
		case ShaderDataType.Float2: return 2;
		case ShaderDataType.Float3: return 3;
		case ShaderDataType.Float4: return 4;
		case ShaderDataType.Mat3:   return 3 * 3;
		case ShaderDataType.Mat4:   return 3 * 4;
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

export class BufferLayout {
	private elements: BufferElement[];
	private stride: number = 0;

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

	public getStride(): number {
		return this.stride;
	}

	public getElements(): BufferElement[] {
		return this.elements;
	}
}

export class VertexBuffer {
	private buffer: WebGLBuffer;
	private layout: BufferLayout;

	public constructor (vertices: Float32Array, usage?: number) {
		this.buffer = Surface.gl.createBuffer();
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, this.buffer);
		Surface.gl.bufferData(Surface.gl.ARRAY_BUFFER, vertices, usage || Surface.gl.STATIC_DRAW);
	}

	public bind() {
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, this.buffer);
	}

	public unbind() {
		Surface.gl.bindBuffer(Surface.gl.ARRAY_BUFFER, null);
	}

	public getLayout(): BufferLayout {
		return this.layout;
	}

	public setLayout(layout: BufferLayout) {
		this.layout = layout;
	}

	public bindBufferBase(target?: number, index: number = 0) {
		Surface.gl.bindBufferBase(target || Surface.gl.TRANSFORM_FEEDBACK_BUFFER, index, this.buffer);
	}

	public unbindBufferBase(target?: number, index: number = 0) {
		Surface.gl.bindBufferBase(target || Surface.gl.TRANSFORM_FEEDBACK_BUFFER, index, null);
	}
}

export class IndexBuffer {
	private buffer: WebGLBuffer;
	private count: number;

	public constructor (indices: Uint16Array) {
		this.buffer = Surface.gl.createBuffer();
		this.count = indices.length;
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
		Surface.gl.bufferData(Surface.gl.ELEMENT_ARRAY_BUFFER, indices, Surface.gl.STATIC_DRAW);
	}

	public bind() {
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
	}

	public unbind() {
		Surface.gl.bindBuffer(Surface.gl.ELEMENT_ARRAY_BUFFER, null);
	}

	public getCount() {
		return this.count;
	}
}
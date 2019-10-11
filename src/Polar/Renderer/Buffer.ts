import Canvas from './Canvas';

export enum ShaderDataType {
	None = 0, Float, Float2, Float3, Float4, Mat3, Mat4, Int, Int2, Int3, Int4, Bool
}

export function shaderDatTypeSizes(type: ShaderDataType): number {
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

	public constructor(type: ShaderDataType, name: string, normalized: boolean = false) {
		this.type = type;
		this.name = name;
		this.size = shaderDatTypeSizes(type);
		this.offset = 0;
		this.normalized = normalized;
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
	private rendererID: WebGLBuffer;
	// TODO: Store layout
	private layout: BufferLayout;

	public constructor (vertices: Float32Array) {
		this.rendererID = Canvas.gl.createBuffer();
		Canvas.gl.bindBuffer(Canvas.gl.ARRAY_BUFFER, this.rendererID);
		Canvas.gl.bufferData(Canvas.gl.ARRAY_BUFFER, vertices, Canvas.gl.STATIC_DRAW);
	}

	public bind(): void {
		Canvas.gl.bindBuffer(Canvas.gl.ARRAY_BUFFER, this.rendererID);
	}

	public unbind(): void {
		Canvas.gl.bindBuffer(Canvas.gl.ARRAY_BUFFER, 0);
	}

	public getLayout(): BufferLayout {
		return this.layout;
	}

	public setLayout(layout: BufferLayout): void {
		this.layout = layout;
	}
}

export class IndexBuffer {
	private rendererID: WebGLBuffer;
	private count: number;

	public constructor (indices: Uint16Array) {
		this.rendererID = Canvas.gl.createBuffer();
		this.count = indices.length;
		Canvas.gl.bindBuffer(Canvas.gl.ELEMENT_ARRAY_BUFFER, this.rendererID);
		Canvas.gl.bufferData(Canvas.gl.ELEMENT_ARRAY_BUFFER, indices, Canvas.gl.STATIC_DRAW);
	}

	public bind(): void {
		Canvas.gl.bindBuffer(Canvas.gl.ELEMENT_ARRAY_BUFFER, this.rendererID);
	}

	public unbind(): void {
		Canvas.gl.bindBuffer(Canvas.gl.ELEMENT_ARRAY_BUFFER, 0);
	}

	public getCount(): number {
		return this.count;
	}
}
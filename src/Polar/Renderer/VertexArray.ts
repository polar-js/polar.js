import { ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer } from './Buffer';
import { Canvas } from './Canvas';
import { Shader }  from './Shader';

function shaderDataTypeToOpenGLBaseType(type: ShaderDataType) {
	switch (type) {
	case ShaderDataType.Float:  return Canvas.gl.FLOAT;
	case ShaderDataType.Float2: return Canvas.gl.FLOAT;
	case ShaderDataType.Float3: return Canvas.gl.FLOAT;
	case ShaderDataType.Float4: return Canvas.gl.FLOAT;
	case ShaderDataType.Mat3:   return Canvas.gl.FLOAT;
	case ShaderDataType.Mat4:   return Canvas.gl.FLOAT;
	case ShaderDataType.Int:    return Canvas.gl.INT;
	case ShaderDataType.Int2:   return Canvas.gl.INT;
	case ShaderDataType.Int3:   return Canvas.gl.INT;
	case ShaderDataType.Int4:   return Canvas.gl.INT;
	case ShaderDataType.Bool:   return Canvas.gl.BOOL;
	}
	console.assert(false, 'Unknown ShaderDataType!');
	return 0;
}

export  class VertexArray {
	private rendererID: WebGLVertexArrayObject;
	private vertexBuffers: VertexBuffer[];
	private indexBuffer: IndexBuffer;

	public constructor () {
		this.rendererID = Canvas.gl.createVertexArray();
		this.vertexBuffers = [];
	}

	public bind(): void {
		Canvas.gl.bindVertexArray(this.rendererID);
	}

	public unbind(): void {
		Canvas.gl.bindVertexArray(0);
	}

	public addVertexBuffer(vertexBuffer: VertexBuffer, shader: Shader): void {
		console.assert(vertexBuffer.getLayout().getElements().length != 0, 'Vertex Buffer has no layout!');

		Canvas.gl.bindVertexArray(this.rendererID);
		vertexBuffer.bind();

		const layout: BufferLayout = vertexBuffer.getLayout();
		for (let element of layout.getElements()) {
			const location = shader.getAttribLocation(element.name);
			Canvas.gl.enableVertexAttribArray(location);
			Canvas.gl.vertexAttribPointer(location, 
				element.getComponentCount(), 
				shaderDataTypeToOpenGLBaseType(element.type),
				element.normalized, 
				layout.getStride(),
				element.offset);
		}
		

		this.vertexBuffers.push(vertexBuffer);
	}

	public setIndexBuffer(indexBuffer: IndexBuffer) {
		Canvas.gl.bindVertexArray(this.rendererID);
		indexBuffer.bind();

		this.indexBuffer = indexBuffer;
	}

	public getVertexBuffers(): VertexBuffer[] {
		return this.vertexBuffers;
	}

	public getIndexBuffer(): IndexBuffer {
		return this.indexBuffer;
	}
}
import { ShaderDataType, BufferLayout, VertexBuffer, IndexBuffer } from './Buffer';
import { Surface } from './Surface';
import { Shader }  from './Shader';

function shaderDataTypeToOpenGLBaseType(type: ShaderDataType) {
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

export  class VertexArray {
	private vertexArray: WebGLVertexArrayObject;
	private vertexBuffers: VertexBuffer[];
	private indexBuffer: IndexBuffer;

	public constructor () {
		this.vertexArray = Surface.gl.createVertexArray();
		this.vertexBuffers = [];
	}

	public bind(): void {
		Surface.gl.bindVertexArray(this.vertexArray);
	}

	public unbind(): void {
		Surface.gl.bindVertexArray(null);
	}

	public addVertexBuffer(vertexBuffer: VertexBuffer, shader: Shader): void {
		console.assert(vertexBuffer.getLayout().getElements().length != 0, 'Vertex Buffer has no layout!');

		Surface.gl.bindVertexArray(this.vertexArray);
		vertexBuffer.bind();

		const layout: BufferLayout = vertexBuffer.getLayout();
		for (const element of layout.getElements()) {
			const location = shader.getAttribLocation(element.name);
			if (location < 0){
				console.error(`Attribute '${element.name}' not found in shader '${shader.getName()}'.`);
			}
			
			Surface.gl.enableVertexAttribArray(location);
			Surface.gl.vertexAttribPointer(location, 
				element.getComponentCount(), 
				shaderDataTypeToOpenGLBaseType(element.type),
				element.normalized, 
				layout.getStride(),
				element.offset);
		}

		this.vertexBuffers.push(vertexBuffer);
	}

	public setIndexBuffer(indexBuffer: IndexBuffer) {
		Surface.gl.bindVertexArray(this.vertexArray);
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
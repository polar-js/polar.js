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
					Surface.gl.vertexAttribPointer(loc, 
						element.getComponentCount() / 4, 
						shaderDataTypeToOpenGLBaseType(element.type),
						element.normalized, 
						layout.getStride(),
						element.offset + 16 * i);
	
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
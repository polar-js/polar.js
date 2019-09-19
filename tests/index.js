class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");

        const shaderVertexSrc = 
        `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_Position;
        out vec3 v_Position;
        
        void main() {
            v_Position = a_Position;
          gl_Position = vec4(a_Position, 1.0);
        }
        `;

        const shaderFragmentSrc = 
        `#version 300 es
        precision mediump float;

        out vec4 color;
        in vec3 v_Position;

        void main() {
            color = vec4(v_Position, 1.0);
        }
        `;

        this.triangleShader = new Polar.Shader("TriangleShader", shaderVertexSrc, shaderFragmentSrc);
        this.triangleShader.bind();

        this.triangleVA = new Polar.VertexArray();

        const triangleVertices = [
            -0.5, -0.5, 0.0,
			 0.5, -0.5, 0.0,
			 0.5,  0.5, 0.0
        ];

        const triangleVertexBuffer = new Polar.VertexBuffer(new Float32Array(triangleVertices));

        const triangleIndices = [0, 1, 2];
        const triangleIndexBuffer = new Polar.IndexBuffer(new Uint16Array(triangleIndices));
        this.triangleVA.setIndexBuffer(triangleIndexBuffer);

        const triangleLayout = new Polar.BufferLayout([
            new Polar.BufferElement(Polar.ShaderDataType.Float3, 'a_Position')
        ]);

        triangleVertexBuffer.setLayout(triangleLayout);
        this.triangleVA.addVertexBuffer(triangleVertexBuffer, this.triangleShader);
        
    }

    onUpdate(deltaTime) {
        this.triangleShader.bind();
        this.triangleVA.bind();
        Polar.RenderCommand.drawIndexed(this.triangleVA);
    }
}

class Sandbox extends Polar.Application {
    constructor(canvasid) {
        super(canvasid);
        this.pushLayer(new ExampleLayer());
    }
}

Polar.create(new Sandbox('polar-canvas'));
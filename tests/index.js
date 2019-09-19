class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");

        const shaderVertexSrc = 
        `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_Position;
        layout(location = 1) in vec4 a_Color;
        out vec3 v_Position;
        out vec4 v_Color;
        
        void main() {
            v_Position = a_Position;
            v_Color = a_Color;
            gl_Position = vec4(a_Position, 1.0);
        }
        `;

        const shaderFragmentSrc = 
        `#version 300 es
        precision mediump float;

        out vec4 color;
        in vec3 v_Position;
        in vec4 v_Color;

        uniform vec3 u_Color;

        void main() {
            color = vec4(u_Color, 1.0);
        }
        `;

        this.triangleShader = new Polar.Shader("TriangleShader", shaderVertexSrc, shaderFragmentSrc);
        this.triangleShader.bind();

        this.triangleVA = new Polar.VertexArray();

        const triangleVertices = [
            -0.5, -0.5, 0.0, 0.1, 0.1, 0.9, 1.0,
			 0.5, -0.5, 0.0, 0.1, 0.9, 0.1, 1.0,
			 0.5,  0.5, 0.0, 0.9, 0.1, 0.1, 1.0
        ];

        const triangleVertexBuffer = new Polar.VertexBuffer(new Float32Array(triangleVertices));

        const triangleIndices = [0, 1, 2];
        const triangleIndexBuffer = new Polar.IndexBuffer(new Uint16Array(triangleIndices));
        this.triangleVA.setIndexBuffer(triangleIndexBuffer);

        const triangleLayout = new Polar.BufferLayout([
            new Polar.BufferElement(Polar.ShaderDataType.Float3, 'a_Position'),
            new Polar.BufferElement(Polar.ShaderDataType.Float4, 'a_Color')
        ]);

        triangleVertexBuffer.setLayout(triangleLayout);
        this.triangleVA.addVertexBuffer(triangleVertexBuffer, this.triangleShader);
        
        this.timeElapsed = 0;
    }

    onUpdate(deltaTime) {
        this.timeElapsed += deltaTime;
        Polar.Renderer.beginScene();


        this.triangleShader.uploadUniformFloat3('u_Color', [this.timeElapsed % 1.0, 0.5, 0.5]);
        Polar.Renderer.submit(this.triangleShader, this.triangleVA);

        Polar.Renderer.endScene();
    }
}

class Sandbox extends Polar.Application {
    constructor(canvasid) {
        super(canvasid);
        this.pushLayer(new ExampleLayer());
    }
}

Polar.create(new Sandbox('polar-canvas'));
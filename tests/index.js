class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");

        const shaderVertexSrc = 
        `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_Position;
        layout(location = 1) in vec4 a_Color;

        uniform mat4 u_ViewProjection;
		uniform mat4 u_Transform;

        out vec3 v_Position;
        out vec4 v_Color;
        
        void main() {
            v_Color = a_Color;
            gl_Position = u_ViewProjection * u_Transform * vec4(a_Position, 1.0);
        }
        `;

        const shaderFragmentSrc = 
        `#version 300 es
        precision mediump float;

        out vec4 color;
        in vec4 v_Color;

        void main() {
            color = v_Color;
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

        this.camera = new Polar.OrthographicCamera(-2.0, 2.0, -1.0, 1.0);
        this.cameraPosition = Polar.glMatrix.vec3.create();
    }

    onUpdate(deltaTime) {
        this.camera.setPosition(this.cameraPosition);

        Polar.Renderer.beginScene(this.camera);

        let transform = Polar.glMatrix.mat4.create();
        //Polar.glMatrix.mat4.fromTranslation(transform, [0, 0, 0]);
        Polar.Renderer.submit(this.triangleShader, this.triangleVA, transform);

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
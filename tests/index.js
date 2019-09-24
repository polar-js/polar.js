class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");
        this.ready = false;

        // const shaderVertexSrc = 
        // `#version 300 es
        // precision highp float;
        
        // layout(location = 0) in vec3 a_Position;
        // layout(location = 1) in vec2 a_TexCoord;

        // uniform mat4 u_ViewProjection;
		// uniform mat4 u_Transform;

        // out vec3 v_Position;
        // out vec2 v_TexCoord;
        
        // void main() {
        //     v_TexCoord = a_TexCoord;
        //     gl_Position = u_ViewProjection * u_Transform * vec4(a_Position, 1.0);
        // }
        // `;

        // const shaderFragmentSrc = 
        // `#version 300 es
        // precision mediump float;

        // out vec4 color;
        // in vec2 v_TexCoord;

        // uniform sampler2D u_Texture;

        // void main() {
        //     color = texture(u_Texture, v_TexCoord);
        // }
        // `;

        // this.textureShader = new Polar.Shader("TriangleShader", shaderVertexSrc, shaderFragmentSrc);
        // this.textureShader.bind();
        this.load();
    }

    async load() {
        this.shaderLibrary = new Polar.ShaderLibrary();
        const textureShader = await this.shaderLibrary.load('shader.glsl', 'TextureShader');
        this.quadVA = new Polar.VertexArray();

        const quadVertices = [
            -0.5, -0.5, 0.0, 0.0, 1.0,
                0.5, -0.5, 0.0, 1.0, 1.0,
                0.5,  0.5, 0.0, 1.0, 0.0,
            -0.5,  0.5, 0.0, 0.0, 0.0
        ];

        const triangleVertexBuffer = new Polar.VertexBuffer(new Float32Array(quadVertices));

        const triangleIndices = [0, 1, 2, 0, 2, 3];
        const triangleIndexBuffer = new Polar.IndexBuffer(new Uint16Array(triangleIndices));
        this.quadVA.setIndexBuffer(triangleIndexBuffer);

        const quadLayout = new Polar.BufferLayout([
            new Polar.BufferElement(Polar.ShaderDataType.Float3, 'a_Position'),
            new Polar.BufferElement(Polar.ShaderDataType.Float2, 'a_TexCoord')
        ]);

        triangleVertexBuffer.setLayout(quadLayout);
        this.quadVA.addVertexBuffer(triangleVertexBuffer, textureShader);

        this.checkerboardTexture = new Polar.Texture2D('checkerboard.png');
        this.alphaTexture = new Polar.Texture2D('alphatest.png');
        textureShader.uploadUniformInt('u_Texture', 0);
        
        this.timeElapsed = 0;
        this.cameraController = new Polar.OrthographicCameraController(Polar.Canvas.get().offsetWidth / Polar.Canvas.get().offsetHeight);
        this.ready = true; // change this if u want Alex
    }

    onUpdate(deltaTime) {
        if (!this.ready) return; // change this if u want Alex
        const textureShader = this.shaderLibrary.get('TextureShader');
        // Update
        this.cameraController.onUpdate(deltaTime);

        // Render
        Polar.Renderer.beginScene(this.cameraController.getCamera());

        this.checkerboardTexture.bind();
        let transform = Polar.glMatrix.mat4.create();
        Polar.Renderer.submit(textureShader, this.quadVA, transform);
        this.alphaTexture.bind();
        let transform2 = Polar.glMatrix.mat4.create();
        //Polar.glMatrix.mat4.translate(transform2, transform2, [0.3, 0.3, 0.0]);
        Polar.Renderer.submit(textureShader, this.quadVA, transform2);

        Polar.Renderer.endScene();
    }
}

class Sandbox extends Polar.Application {
    constructor(canvasid) {
        super(canvasid);
        this.pushLayer(new ExampleLayer());
    }
}

if (window.location.protocol == 'file:') {
    document.writeln('Error: Must be run in http-server to allow file access.');
} else {
    Polar.create(new Sandbox({displayMode: 'fill'}));
}
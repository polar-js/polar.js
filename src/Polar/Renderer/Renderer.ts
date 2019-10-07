import { mat4 } from 'gl-matrix';
import VertexArray from 'Polar/Renderer/VertexArray';
import Shader from 'Polar/Renderer/Shader';
import RenderCommand from 'Polar/Renderer/RenderCommand';
import OrthographicCamera from 'Polar/Renderer/Camera';
import ShaderLibrary from 'Polar/Renderer/ShaderLibrary';
import { VertexBuffer, BufferElement, BufferLayout, ShaderDataType, IndexBuffer } from 'Polar/Renderer/Buffer';
import Sprite from './Sprite';

export default class Renderer {
    private static viewProjectionMatrix: mat4;
    private static quadVA: VertexArray;
    private static shaderLibrary: ShaderLibrary;

    public static init() {
        RenderCommand.init();

        this.shaderLibrary = new ShaderLibrary();
        const textureShader = new Shader('TextureShader', 
        `#version 300 es
        precision highp float;
        
        layout(location = 0) in vec3 a_Position;
        layout(location = 1) in vec2 a_TexCoord;
        
        uniform mat4 u_ViewProjection;
        uniform mat4 u_Transform;
        
        out vec3 v_Position;
        out vec2 v_TexCoord;
        
        void main() {
            v_TexCoord = a_TexCoord;
            gl_Position = u_ViewProjection * u_Transform * vec4(a_Position, 1.0);
        }`, 
        `#version 300 es
        precision mediump float;
        
        out vec4 color;
        in vec2 v_TexCoord;
        
        uniform sampler2D u_Texture;
        
        void main() {
            color = texture(u_Texture, v_TexCoord);
        }`);

        this.shaderLibrary.add(textureShader);

        this.quadVA = new VertexArray();

        const quadVertices = [
            -0.5, -0.5, 0.0, 0.0, 1.0,
             0.5, -0.5, 0.0, 1.0, 1.0,
             0.5,  0.5, 0.0, 1.0, 0.0,
            -0.5,  0.5, 0.0, 0.0, 0.0
        ];

        const quadVB = new VertexBuffer(new Float32Array(quadVertices));

        const quadIndices = [0, 1, 2, 0, 2, 3];
        const quadIB = new IndexBuffer(new Uint16Array(quadIndices));
        this.quadVA.setIndexBuffer(quadIB);

        const quadLayout = new BufferLayout([
            new BufferElement(ShaderDataType.Float3, 'a_Position'),
            new BufferElement(ShaderDataType.Float2, 'a_TexCoord')
        ]);

        quadVB.setLayout(quadLayout);
        this.quadVA.addVertexBuffer(quadVB, textureShader);
    }

    public static beginScene(camera: OrthographicCamera): void {
        this.viewProjectionMatrix = camera.getViewProjectionMatrix();
    }

    public static endScene(): void {

    }

    public static submit(sprite: Sprite): void {
        const shader = this.shaderLibrary.get('TextureShader');
        sprite.getTexture().bind();

        shader.bind();
        shader.uploadUniformInt('u_Texture', 0);
        shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
        shader.uploadUniformMat4('u_Transform', sprite.getTransform());

        this.quadVA.bind();
        RenderCommand.drawIndexed(this.quadVA);
    }
}
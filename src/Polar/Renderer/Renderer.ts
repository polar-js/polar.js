import { mat4 } from 'gl-matrix';
import VertexArray from 'Polar/Renderer/VertexArray';
import Shader from 'Polar/Renderer/Shader';
import RenderCommand from 'Polar/Renderer/RenderCommand';
import OrthographicCamera from 'Polar/Renderer/Camera';

export default class Renderer {
    private static viewProjectionMatrix: mat4;

    public static init(): void {
        RenderCommand.init();
    }

    public static beginScene(camera: OrthographicCamera): void {
        this.viewProjectionMatrix = camera.getViewProjectionMatrix();
    }

    public static endScene(): void {

    }

    public static submit(shader: Shader, vertexArray: VertexArray, transform: mat4): void {
        shader.bind();
        
        shader.uploadUniformMat4('u_ViewProjection', this.viewProjectionMatrix);
        shader.uploadUniformMat4('u_Transform', transform);

        vertexArray.bind();
        RenderCommand.drawIndexed(vertexArray);
    }
}
import { mat4 } from 'gl-matrix';
import VertexArray from './VertexArray';
import Shader from 'Renderer/Shader';
import RenderCommand from './RenderCommand';
import OrthographicCamera from 'Renderer/Camera';

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
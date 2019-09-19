import { mat4 } from 'gl-matrix';
import VertexArray from './VertexArray';
import Shader from './Shader';
import RenderCommand from './RenderCommand';

export default class Renderer {
    // TODO: Transformation matrices
    //private viewProjectionMatrix: mat4;

    public static init(): void {
        RenderCommand.init();
    }

    public static beginScene(): void {
        // TODO: Transformation matrices
    }

    public static endScene(): void {

    }

    public static submit(shader: Shader, vertexArray: VertexArray): void {
        shader.bind();

        // TODO: Transformation matrices.

        vertexArray.bind();
        RenderCommand.drawIndexed(vertexArray);
    }
}
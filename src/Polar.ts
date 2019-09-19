import Application from "./Application";
import Layer from "./Layer";
import RenderCommand from './Renderer/RenderCommand'
import { ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer } from './Renderer/Buffer'
import VertexArray from './Renderer/VertexArray';
import Shader from './Renderer/Shader';

let application: Application;

export function create(app: Application) {
    application = app;
    application.start();
}

export function stop() {
    application.stop();
}

export { Application, Layer, RenderCommand, ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer, VertexArray, Shader };
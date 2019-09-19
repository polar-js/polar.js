import Application from "./Application";
import Layer from "./Layer";
import Renderer from './Renderer/Renderer'
import { ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer } from './Renderer/Buffer'
import VertexArray from './Renderer/VertexArray';
import Shader from './Renderer/Shader';
import * as glMatrix from 'gl-matrix';

let application: Application;

export function create(app: Application) {
    application = app;
    application.start();
}

export function stop() {
    application.stop();
}

export { Application, Layer, Renderer, ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer, VertexArray, Shader, glMatrix };
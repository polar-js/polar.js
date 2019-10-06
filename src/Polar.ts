import * as glMatrix from 'gl-matrix';

import Application from "Polar/Core/Application";
import Layer from "Polar/Core/Layer";
import Renderer from 'Polar/Renderer/Renderer'
import { ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer } from 'Polar/Renderer/Buffer'
import VertexArray from 'Polar/Renderer/VertexArray';
import Shader from 'Polar/Renderer/Shader';
import OrthographicCamera from 'Polar/Renderer/Camera';
import Input from 'Polar/Core/Input';
import OrthographicCameraController from 'Polar/OrthographicCameraController';
import Canvas from 'Polar/Renderer/Canvas';
import Texture2D from 'Polar/Renderer/Texture';
import ShaderLibrary from 'Polar/Renderer/ShaderLibrary';

let application: Application;

export function create(app: Application) {
    application = app;
    application.start();
}

export function stop() {
    application.stop();
}

export { Application, Layer, Renderer, Canvas, ShaderDataType, BufferElement, BufferLayout, VertexBuffer, IndexBuffer, VertexArray, Shader, ShaderLibrary, Texture2D, glMatrix, OrthographicCamera, Input, OrthographicCameraController };
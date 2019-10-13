import * as glMatrix from 'gl-matrix';
import { Application } from 'Polar/Core/Application';

let application: Application;

export function create(app: Application) {
	console.assert(application == null, 'Application has already been created!');
	application = app;
	application.start();
}

export function stop() {
	console.assert(application != null, 'Application has not been created yet!');
	application.stop();
	application = null;
}

export { Application, glMatrix };

export * from 'Polar/Core/Layer';
export * from 'Polar/Renderer/Renderer';
export * from 'Polar/Renderer/Buffer';
export * from 'Polar/Renderer/VertexArray';
export * from 'Polar/Renderer/Shader';
export * from 'Polar/Renderer/Camera';
export * from 'Polar/Core/Input';
export * from 'Polar/Util/OrthographicCameraController';
export * from 'Polar/Renderer/Canvas';
export * from 'Polar/Renderer/Texture';
export * from 'Polar/Renderer/ShaderLibrary';
export * from 'Polar/Renderer/Sprite';
export * from 'Polar/ECS/ECS';
export * from 'Polar/ECS/Components';
export * from 'Polar/ECS/CameraControllerSystem';
export * from 'Polar/ECS/RenderSystem';
export * from 'Polar/Util/Timer';
export * from 'Polar/Renderer/TextureAtlas';
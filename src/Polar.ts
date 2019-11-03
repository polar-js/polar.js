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

import * as glm from 'gl-matrix';
import * as p2 from 'p2';
import * as TextureShaderSource from 'Polar/Renderer/ShaderSource/TextureShaderSource';
import * as ColorShaderSource from 'Polar/Renderer/ShaderSource/ColorShaderSource';
import * as ScreenShaderSource from 'Polar/Renderer/ShaderSource/PassthroughShaderSource';
import * as InvertShaderSource from 'Polar/Renderer/ShaderSource/InvertShaderSource';

export { Application, glm, p2, TextureShaderSource, ColorShaderSource, ScreenShaderSource, InvertShaderSource };

export * from 'Polar/Core/Layer';
export * from 'Polar/Core/Input';
export * from 'Polar/Core/LayerStack';
export * from 'Polar/Core/ApplicationSettings';
export * from 'Polar/Renderer/Buffer';
export * from 'Polar/Renderer/FrameBuffer';
export * from 'Polar/Renderer/ImageLibrary';
export * from 'Polar/Renderer/OrthographicCamera';
export * from 'Polar/Renderer/ParticleEmitter';
export * from 'Polar/Renderer/ParticleRenderer';
export * from 'Polar/Renderer/RenderBuffer';
export * from 'Polar/Renderer/Renderer';
export * from 'Polar/Renderer/Shader';
export * from 'Polar/Renderer/ShaderLibrary';
export * from 'Polar/Renderer/Sprite';
export * from 'Polar/Renderer/Surface';
export * from 'Polar/Renderer/Texture';
export * from 'Polar/Renderer/TextureAtlas';
export * from 'Polar/Renderer/VertexArray';
export * from 'Polar/ECS/ECS';
export * from 'Polar/ECS/Components';
export * from 'Polar/ECS/Systems/CameraControllerSystem';
export * from 'Polar/ECS/Systems/RenderSystem';
export * from 'Polar/ECS/Systems/Physics';
export * from 'Polar/ECS/Systems/ParticleSystem';
export * from 'Polar/Util/Timer';
export * from 'Polar/Util/OrthographicCameraController';
export * from 'Polar/Util/Math';
export * from 'Polar/ECS/Systems/FPSDebugSystem';


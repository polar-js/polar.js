import * as glm from 'gl-matrix';
import { OrthographicCamera } from '../Renderer/OrthographicCamera';
import { Input } from '../Core/Input';
import { Event, EventDispatcher, EventHandler } from '../Events/Event';
import { CanvasResizeEvent } from 'Polar/Events/ApplicationEvent';
import { MouseWheelEvent } from 'Polar/Events/MouseEvent';

/** Class which controls the input and control of an orthographic camera. */
export class OrthographicCameraController implements EventHandler {
	private aspectRatio: number;
	private zoomLevel: number;
	private camera: OrthographicCamera;

	private doRotation: boolean;

	// The camera's position in world space.
	private cameraPosition: glm.vec3 = glm.vec3.create();
	// The camera's current rotation.
	private cameraRotation = 0.0;
	// How fast the camera rotates in radians per second.
	private cameraRotationSpeed = Math.PI / 2;

	/**
	 * Create an orthographic camera controller.
	 * @param {number} aspectRatio The aspect ratio of the camera's view port. width / height.
	 * @param {number} [initialZoomLevel=1.0] The initial zoom of the camera.
	 * @param {boolean} [doRotation=false] Turn on / off camera rotation controls.
	 */
	public constructor(aspectRatio: number, initialZoomLevel: number = 1.0, doRotation: boolean = false) {
		this.aspectRatio = aspectRatio;
		this.zoomLevel = initialZoomLevel;
		this.doRotation = doRotation;
		this.camera = new OrthographicCamera(-this.aspectRatio * this.zoomLevel, this.aspectRatio * this.zoomLevel, -this.zoomLevel, this.zoomLevel);
	}

	/**
	 * Update function to be called every frame to update the camera controller.
	 * @param {number} deltaTime The elapsed time between the previous and current frame in seconds.
	 */
	public onUpdate(deltaTime: number) {
		let doPosition = false;
		if (Input.isKeyPressed('a')) {
			this.cameraPosition[0] -=  this.cameraTranslationSpeed(this.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('d')) {
			this.cameraPosition[0] += this.cameraTranslationSpeed(this.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('s')) {
			this.cameraPosition[1] -= this.cameraTranslationSpeed(this.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('w')) {
			this.cameraPosition[1] += this.cameraTranslationSpeed(this.zoomLevel) * deltaTime;
			doPosition = true;
		}

		if (this.doRotation) {
			let doRotation = false;
			if (Input.isKeyPressed('q')) {
				this.cameraRotation += this.cameraRotationSpeed * deltaTime;
				doRotation = true;
			}
			if (Input.isKeyPressed('e')) {
				this.cameraRotation -= this.cameraRotationSpeed * deltaTime;
				doRotation = true;
			}
			if (doRotation) {
				this.camera.setRotation(this.cameraRotation);
			}
		}
		
		// Only recalculate if the position has changed.
		if (doPosition)
			this.camera.setPosition(this.cameraPosition);
	}

	public onEvent(event: Event) {
		const dispatcher = new EventDispatcher(event);
		dispatcher.dispatch(CanvasResizeEvent, this.onCanvasResize.bind(this));
		dispatcher.dispatch(MouseWheelEvent, this.onMouseWheel.bind(this));
	}

	private onCanvasResize(event: CanvasResizeEvent): boolean {
		this.aspectRatio = event.width / event.height;
		this.camera.setProjection(-this.aspectRatio * this.zoomLevel, this.aspectRatio * this.zoomLevel, -this.zoomLevel, this.zoomLevel);
		return false;
	}

	private onMouseWheel(event: MouseWheelEvent): boolean {
		this.zoomLevel += event.deltaY / 1000 * this.zoomLevel;
		this.zoomLevel = this.zoomLevel > 0.1 ? this.zoomLevel : 0.1;
		this.camera.setProjection(-this.aspectRatio * this.zoomLevel, this.aspectRatio * this.zoomLevel, -this.zoomLevel, this.zoomLevel);
		return false;
	}

	/**
	 * Get the internal camera controlled by the OrthographicCameraController.
	 * @returns {Camera} The internal camera  object.
	 */
	public getCamera(): OrthographicCamera {
		return this.camera;
	}

	/**
	 * A sigmoid function to calculate The speed of the camera at the specified zoom.
	 * @param {number} zoom The current zoom of the camera.
	 * @returns {Camera} The speed of the camera in world units / second.
	 */
	private cameraTranslationSpeed(zoom: number): number {
		return 20 / (1 + 30 * Math.pow(Math.E, -0.4 * zoom));
	}
}
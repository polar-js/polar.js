import * as glm from 'gl-matrix';
import { System } from '../System';
import { Component} from '../Component';
import { Entity } from '../Entity';
import { CameraCP } from '../Components';
import { OrthographicCamera } from '../../Renderer/OrthographicCamera';
import { Surface } from '../../Renderer/Surface';
import { Input } from '../../Core/Input';

/** A simple camera movement controller. */
export class CameraControllerSystem extends System {

	public onAttach(): void {
		const controllerData: CameraControllerCP = <CameraControllerCP>this.getManager().getSingleton('Polar:CameraController');

		let aspectRatio = controllerData.aspectRatio == 0 ? Surface.getWidth() / Surface.getHeight() : controllerData.aspectRatio;

		(<CameraCP>this.getManager().getSingleton('Polar:Camera')).camera = new OrthographicCamera(-aspectRatio * controllerData.zoomLevel, 
			aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);

		let camera = (<CameraCP>this.getManager().getSingleton('Polar:Camera')).camera;

		window.addEventListener('mousewheel', (ev: MouseWheelEvent) => {
			controllerData.zoomLevel += ev.deltaY / 1000 * controllerData.zoomLevel;
			controllerData.zoomLevel = controllerData.zoomLevel > 0.1 ? controllerData.zoomLevel : 0.1;
			camera.setProjection(-aspectRatio * controllerData.zoomLevel, aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);
		});

		Surface.addResizeCallback(canvas => {
			aspectRatio = canvas.width / canvas.height;
			camera.setProjection(-aspectRatio * controllerData.zoomLevel, aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);
		});

		camera.setPosition(controllerData.cameraPosition);
		camera.setRotation(controllerData.cameraRotation);
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {}

	public beginUpdate(deltaTime: number): void {
		const controllerData: CameraControllerCP = <CameraControllerCP>this.getManager().getSingleton('Polar:CameraController');
		let camera = (<CameraCP>this.getManager().getSingleton('Polar:Camera')).camera;

		let doPosition = false;
		if (Input.isKeyPressed('a')) {
			controllerData.cameraPosition[0] -=  this.cameraTranslationSpeed(controllerData.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('d')) {
			controllerData.cameraPosition[0] += this.cameraTranslationSpeed(controllerData.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('s')) {
			controllerData.cameraPosition[1] -= this.cameraTranslationSpeed(controllerData.zoomLevel) * deltaTime;
			doPosition = true;
		}
		if (Input.isKeyPressed('w')) {
			controllerData.cameraPosition[1] += this.cameraTranslationSpeed(controllerData.zoomLevel) * deltaTime;
			doPosition = true;
		}

		if (controllerData.doRotation) {
			let doRotation = false;
			if (Input.isKeyPressed('q')) {
				controllerData.cameraRotation += controllerData.cameraRotationSpeed * deltaTime;
				doRotation = true;
			}
			if (Input.isKeyPressed('e')) {
				controllerData.cameraRotation -= controllerData.cameraRotationSpeed * deltaTime;
				doRotation = true;
			}
			if (doRotation) {
				camera.setRotation(controllerData.cameraRotation);
			}
		}
		
		// Only recalculate if the position has changed.
		if (doPosition)
			camera.setPosition(controllerData.cameraPosition);
	}

	public endUpdate(dt: number): void {}

	public getComponentTuples(): string[][] {
		return [];
	}

	public getName(): string {
		return 'Polar:CameraControllerSystem';
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

export class CameraControllerCP extends Component {

	public readonly type = 'Polar:CameraController';
	/** The camera's aspect ratio. */
	public aspectRatio: number = 0;
	/** The camera's zoom. */
	public zoomLevel: number = 1;
	/** Whether the camera will rotate using Q and E. */
	public doRotation: boolean = false;
	/** The camera's position in world space. */
	public cameraPosition: glm.vec3 = glm.vec3.create();
	/** The camera's current rotation. */
	public cameraRotation: number = 0.0;
	/** How fast the camera rotates in radians per second. */
	public cameraRotationSpeed: number = Math.PI/2;

	/**
	 * Create a new camera controller component.
	 * @param {number} [aspectRatio=0] The aspect ratio of the camera. If 0, will use the canvas' aspect ratio.
	 * @param {number} [zoomLevel=1] The initial zoom of the camera.
	 * @param {boolean} [doRotation=false] Allows the camera to be rotated using the Q and E keys.
	 * @param {glm.vec3} [cameraPosition=vec3.create()] The initial position of the camera.
	 * @param {number} [cameraRotation=0.0] The initial rotation of the camera.
	 * @param {number} [cameraRotationSpeed=Math.PI/2] The rotation speed of the camera in radians per second.
	 */
	public constructor(aspectRatio: number = 0, zoomLevel: number = 1, doRotation: boolean = false, cameraPosition: glm.vec3 = glm.vec3.create(), cameraRotation: number = 0.0, cameraRotationSpeed: number = Math.PI/2) {
		super();
		this.aspectRatio = aspectRatio;
		this.zoomLevel = zoomLevel;
		this.doRotation = doRotation;
		this.cameraPosition = cameraPosition;
		this.cameraRotation = cameraRotation;
		this.cameraRotationSpeed = cameraRotationSpeed;
	}
}
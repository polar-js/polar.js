import * as glm from 'gl-matrix';
import { System, Entity, Component } from 'Polar/ECS/ECS';
import { CameraCP } from 'Polar/ECS/Components';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import { Surface } from 'Polar/Renderer/Surface';
import { Input } from 'Polar/Core/Input';

/** A simple camera movement controller. */
export class CameraControllerSystem extends System {

	public onAttach(): void {
		const controllerData: CameraControllerCP = <CameraControllerCP>this.manager.getSingleton('Polar:CameraController');
		(<CameraCP>this.manager.getSingleton('Polar:Camera')).camera = new OrthographicCamera(-controllerData.aspectRatio * controllerData.zoomLevel, 
			controllerData.aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);

		let camera = (<CameraCP>this.manager.getSingleton('Polar:Camera')).camera;

		window.addEventListener('mousewheel', (ev: MouseWheelEvent) => {
			controllerData.zoomLevel += ev.deltaY / 1000 * controllerData.zoomLevel;
			controllerData.zoomLevel = controllerData.zoomLevel > 0.1 ? controllerData.zoomLevel : 0.1;
			camera.setProjection(-controllerData.aspectRatio * controllerData.zoomLevel, controllerData.aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);
		});

		window.addEventListener('resize', (ev: UIEvent) => {
			controllerData.aspectRatio = Surface.getWidth() / Surface.getHeight();
			camera.setProjection(-controllerData.aspectRatio * controllerData.zoomLevel, controllerData.aspectRatio * controllerData.zoomLevel, -controllerData.zoomLevel, controllerData.zoomLevel);
		});
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {}

	public beginUpdate(deltaTime: number): void {
		const controllerData: CameraControllerCP = <CameraControllerCP>this.manager.getSingleton('Polar:CameraController');
		let camera = (<CameraCP>this.manager.getSingleton('Polar:Camera')).camera;

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
	public aspectRatio: number;
	public zoomLevel: number;

	public doRotation: boolean;

	// The camera's position in world space.
	public cameraPosition: glm.vec3;
	// The camera's current rotation.
	public cameraRotation: number;
	// How fast the camera rotates in radians per second.
	public cameraRotationSpeed: number;

	/**
	 * Create a new camera controller component.
	 * @param {number} [aspectRatio=1] The aspect ratio of the camera.
	 * @param {number} [zoomLevel=1] The initial zoom of the camera.
	 * @param {boolean} [doRotation=false] Allows the camera to be rotated using the Q and E keys.
	 * @param {glm.vec3} [cameraPosition=vec3.create()] The initial position of the camera.
	 * @param {number} [cameraRotation=0.0] The initial rotation of the camera.
	 * @param {number} [cameraRotationSpeed=Math.PI/2] The rotation speed of the camera in radians per second.
	 */
	public constructor(aspectRatio: number = 1, zoomLevel: number = 1, doRotation: boolean = false, cameraPosition: glm.vec3 = glm.vec3.create(), cameraRotation: number = 0.0, cameraRotationSpeed: number = Math.PI/2) {
		super();
		this.aspectRatio = aspectRatio;
		this.zoomLevel = zoomLevel;
		this.doRotation = doRotation;
		this.cameraPosition = cameraPosition;
		this.cameraRotation = cameraRotation;
		this.cameraRotationSpeed = cameraRotationSpeed;
	}

	public getType(): string { return 'Polar:CameraController'; }
}
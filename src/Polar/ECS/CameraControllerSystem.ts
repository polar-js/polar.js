import { System, Entity } from 'Polar/ECS/ECS';
import { CameraCP, CameraControllerCP } from 'Polar/ECS/Components';
import { OrthographicCamera } from 'Polar/Renderer/Camera';
import { Surface } from 'Polar/Renderer/Surface';
import { Input } from 'Polar/Core/Input';

/** A simple camera movement controller. */
export  class CameraControllerSystem extends System {

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
			controllerData.aspectRatio = Surface.get().offsetWidth / Surface.get().offsetHeight;
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
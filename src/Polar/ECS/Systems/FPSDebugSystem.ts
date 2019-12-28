import * as glm from 'gl-matrix';
import { System } from '../System';
import { Component} from '../Component';
import { Entity } from '../Entity';
import { Timer } from '../../Util/Timer';
import { Surface } from '../../Renderer/Surface';

export class FPSDebugSystem extends System {

	public onAttach(): void {
		// Setup FPS timer.
		const systemData = <FPSDebugCP>this.getManager().getSingleton('Polar:FPSDebug');
		if (!systemData) {
			console.error('FPS Debug System requires FPSDebugCP singleton to store data.');
		}
		systemData.timer = new Timer(1, false, true);
		systemData.fps = 0;
		systemData.numUpdates = 0;
	}

	public beginUpdate(dt: number): void {
		// Check FPS timer.
		const systemData = <FPSDebugCP>this.getManager().getSingleton('Polar:FPSDebug');
		systemData.numUpdates++;
		if (systemData.timer.update(dt)) {
			systemData.fps = Math.round(systemData.numUpdates);
			systemData.numUpdates = 0;
		}
		
		// Render current FPS.
		Surface.font.font = systemData.font;
		Surface.font.fillStyle = systemData.fillStyle;
		Surface.font.fillText(`FPS: ${systemData.fps}`, systemData.position[0], systemData.position[1]);
	}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {}
	public endUpdate(dt: number): void {}
	public getComponentTuples(): string[][] { return []; }
	public getName(): string { return 'Polar:FPSDebugSystem'; }
}

/** Singleton component class used to store data about an FPS debug system. */
export class FPSDebugCP extends Component {

	public position: glm.vec2;
	public font: string;
	public fillStyle: string;

	public timer: Timer;
	public fps: number;
	public numUpdates: number;

	/**
	 * Create a new FPS debug component.
	 * @param {glm.vec2} [position=[10, 30]] The position which the FPS text will be rendered.
	 * @param {string} [font='20px Arial'] The font.
	 * @param {string} [fillStyle='red'] The fill style.
	 */
	public constructor(position: glm.vec2 = glm.vec2.fromValues(10, 30), font: string = '20px Arial', fillStyle: string = 'red') {
		super();
		this.position = position;
		this.font = font;
		this.fillStyle = fillStyle;
	}

	public readonly type = 'Polar:FPSDebug';
}
import * as glm from 'gl-matrix';
import { System } from '../System';
import { Entity } from '../Entity';
import { Event } from '../../Events/Event';
import { LightRenderer } from '../../Renderer/LightRenderer';
import { Renderer } from '../../Renderer/Renderer';
import { TransformCP } from '../Components';

/**
 * A system which renders lights in a scene.
 * 
 * @system 'Polar:LightRenderSystem'
 * @tuples ['Polar:Transform', 'Polar:PointLight']
 */
export class LightRenderSystem extends System {

	public onAttach(): void {
		Renderer.enableLighting();
	}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		const lightData = <PointLightCP>entity.getComponent('Polar:PointLight');
		const transformData = <TransformCP>entity.getComponent('Polar:Transform');
		LightRenderer.submitLight(lightData.color, lightData.intensity, transformData.transform);
	}

	public beginUpdate(dt: number): void {}

	public endUpdate(dt: number): void {}

	public onEvent(event: Event): void {}

	public getComponentTuples(): string[][] {
		return [
			['Polar:Transform', 'Polar:PointLight']
		];
	}

	public getName(): string {
		return 'Polar:LightRendererSystem';
	}
}

/** A component which stores information about a point light which illuminates a 2D scene. */
export class PointLightCP {

	public readonly type = 'Polar:PointLight';

	/** The color of the light. */
	public color: glm.vec3;
	/** The intensity of the light, from 0 to 1. If the value is raised above 1, the edges of the light will appear more bright and the center will not get brighter. */
	public intensity: number;

	/**
	 * Copy a light from an existing one.
	 * @param {glm.vec3} color The light's color.
	 * @param {number} intensity How bright the light will appear, from 0 to 1. 
	 */
	public constructor(color: glm.vec3, intensity: number) {
		this.color = color;
		this.intensity = intensity;
	}
}
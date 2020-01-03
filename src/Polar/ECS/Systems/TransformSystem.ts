import { System } from '../System';
import { Entity } from '../Entity';
import { TransformCP } from '../Components';
import { createTransform } from '../../Util/Math';
import { Event } from '../../Events/Event';

export class TransformSystem extends System {
	
	public onAttach(): void {}

	public beginUpdate(deltaTime: number): void {}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		let transform = <TransformCP>entity.getComponent('Polar:Transform');
		if (transform.modified) {
			transform.transform = createTransform(
				transform.x, 
				transform.y, 
				transform.rotation,
				transform.scaleX,
				transform.scaleY, 
				0.0
			);
		}
	}
	
	public endUpdate(dt: number): void {}
	
	public onEvent(event: Event): void {}

	public getComponentTuples(): string[][] {
		return [['Polar:Transform']];
	}

	public getName(): string {
		return 'Polar:TransformSystem';
	}
}
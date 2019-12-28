import { System } from '../System';
import { Entity } from '../Entity';
import { TransformCP } from '../Components';
import { createTransform } from '../../Util/Math';

export class TransformSystem extends System {

	public onAttach(): void {}

	public beginUpdate(deltaTime: number): void {}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		let transform = <TransformCP>entity.getComponent('Polar:Transform');
		if (transform.modified) {
			transform.transform = createTransform(transform.x, transform.y, transform.scale, transform.scale, transform.rotation, 0);
		}
	}

	public endUpdate(dt: number): void {}

	public getComponentTuples(): string[][] {
		return [['Polar:Transform']];
	}

	public getName(): string {
		return 'Polar:TransformSystem';
	}
}
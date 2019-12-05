import { System } from 'Polar/ECS/System';
import { Entity } from 'Polar/ECS/Entity';
import { TransformCP } from 'Polar/ECS/Components';
import { createTransform } from 'Polar/Util/Math';

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
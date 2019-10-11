import { System, Entity } from 'Polar/ECS/ECS';

export default class RenderSystem extends System {

	public getComponentTuples(): string[][] {
		return [];
	}

	public getName(): string {
		return 'RenderSystem';
	}

	public onEntityUpdate(dt: number, entity: Entity): void {
		
	}
}
import { System, Entity } from 'Polar/ECS/ECS';
import { Renderer } from 'Polar/Renderer/Renderer';
import { Texture2DCP, TransformCP, CameraCP }from 'Polar/ECS/Components';

export class RenderSystem extends System {

	public onAttach(): void {
	}

	public onDetach(): void {
		super.onDetach();
	}

	public getComponentTuples(): string[][] {
		return [['Polar:Transform', 'Polar:Texture2D']];
	}

	public getName(): string {
		return 'Polar:RenderSystem';
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		Renderer.submit((<Texture2DCP>entity.getComponent('Polar:Texture2D')).texture, (<TransformCP>entity.getComponent('Polar:Transform')).transform);
	}

	public beginUpdate(dt: number): void {
		Renderer.beginScene((<CameraCP>this.manager.getSingleton('Polar:Camera')).camera);
	}

	public endUpdate(dt: number): void {
		Renderer.endScene();
	}
}
import { System, Entity } from 'Polar/ECS/ECS';
import { Renderer } from 'Polar/Renderer/Renderer';
import { Texture2DCP, TransformCP, CameraCP } from 'Polar/ECS/Components';
import { PhysicsBodyCP } from 'Polar/ECS/Systems/Physics';
import { createTransform } from 'Polar/Util/Math';

/** System which renders entities.
 * 
 * @system 'Polar:RenderSystem'
 * @tuples {'Polar:Transform', 'Polar:Texture2D'}, {'Polar:PhysicsBody', 'Polar:Texture2D'}
 */
export class RenderSystem extends System {

	public onAttach(): void {}

	public getComponentTuples(): string[][] {
		return [['Polar:Transform', 'Polar:Texture2D'], ['Polar:PhysicsBody', 'Polar:Texture2D']];
	}

	public getName(): string {
		return 'Polar:RenderSystem';
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		// Render sprites.
		if (subIndex == 0) {
			Renderer.submitTextured((<Texture2DCP>entity.getComponent('Polar:Texture2D')).texture, (<TransformCP>entity.getComponent('Polar:Transform')).transform);
		}
		// Render physics bodies.
		else if (subIndex == 1) {
			const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
			const texture = <Texture2DCP>entity.getComponent('Polar:Texture2D');
			Renderer.submitTextured(texture.texture, createTransform(body.position[0], body.position[1], texture.width, texture.height, body.angle));
			console.log(`${body.position[0]}, ${body.position[1]}, ${texture.texture.getWidth()}, ${texture.texture.getWidth()}, ${body.angle}`);
		}
	}

	public beginUpdate(dt: number): void {
		Renderer.beginScene((<CameraCP>this.manager.getSingleton('Polar:Camera')).camera);
	}

	public endUpdate(dt: number): void {
		Renderer.endScene();
	}
}
import { System, Entity } from 'Polar/ECS/ECS';
import { Renderer } from 'Polar/Renderer/Renderer';
import { Texture2DCP, TransformCP, CameraCP } from 'Polar/ECS/Components';
import { PhysicsBodyCP } from 'Polar/ECS/Physics';
import { vec3, mat4 } from 'gl-matrix';

export class RenderSystem extends System {

	public onAttach(): void {
	}

	public onDetach(): void {
		super.onDetach();
	}

	public getComponentTuples(): string[][] {
		return [['Polar:Transform', 'Polar:Texture2D'], ['Polar:PhysicsBody', 'Polar:Texture2D']];
	}

	public getName(): string {
		return 'Polar:RenderSystem';
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		// Render sprites.
		if (subIndex == 0) {
			Renderer.submit((<Texture2DCP>entity.getComponent('Polar:Texture2D')).texture, (<TransformCP>entity.getComponent('Polar:Transform')).transform);
		}
		// Render physics bodies.
		else if (subIndex == 1) {
			const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
			let transform = mat4.create();
			transform = mat4.translate(transform, transform, vec3.fromValues(body.position[0], body.position[1], 0));
			transform = mat4.rotate(transform, transform, body.angle, vec3.fromValues(0, 0, 1));
			Renderer.submit((<Texture2DCP>entity.getComponent('Polar:Texture2D')).texture, transform);
		}
	}

	public beginUpdate(dt: number): void {
		Renderer.beginScene((<CameraCP>this.manager.getSingleton('Polar:Camera')).camera);
	}

	public endUpdate(dt: number): void {
		Renderer.endScene();
	}
}
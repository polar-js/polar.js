import { System } from '../System';
import { Entity } from '../Entity';
import { Component } from '../Component';
import { TextureRefCP, TextureLibraryCP } from '../Systems/TextureLoad';
import { Renderer } from '../../Renderer/Renderer';
import { Texture2DCP, TransformCP, CameraCP } from '../Components';
import { PhysicsBodyCP } from './Physics';
import { createTransform } from '../../Util/Math';
import * as glm from 'gl-matrix';

/** System which renders entities.
 * 
 * @system 'Polar:RenderSystem'
 * @tuples {'Polar:Transform', 'Polar:Texture2D'}, {'Polar:PhysicsBody', 'Polar:Texture2D'}
 */
export class RenderSystem extends System {

	public onAttach(): void {}

	public getComponentTuples(): string[][] {
		return [
			['Polar:Transform', 'Polar:Texture2D'],
			['Polar:PhysicsBody', 'Polar:Texture2D'],
			['Polar:Transform', 'Polar:TextureRef'],
			['Polar:PhysicsBody', 'Polar:TextureRef'],
			['Polar:Transform', 'Polar:Outline']];
	}

	public getName(): string {
		return 'Polar:RenderSystem';
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		// Render sprites with Texture2D component.
		if (subIndex == 0) {
			Renderer.submitTextured((<Texture2DCP>entity.getComponent('Polar:Texture2D')).texture, (<TransformCP>entity.getComponent('Polar:Transform')).transform);
		}
		// Render physics bodies with Texture2D component.
		else if (subIndex == 1) {
			const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
			const texture = <Texture2DCP>entity.getComponent('Polar:Texture2D');
			Renderer.submitTextured(texture.texture, createTransform(body.position[0], body.position[1], texture.width, texture.height, body.angle));
			console.log(`${body.position[0]}, ${body.position[1]}, ${texture.texture.getWidth()}, ${texture.texture.getWidth()}, ${body.angle}`);
		}
		// Render sprites with TextureRef component.
		else if (subIndex == 2) {
			const textureCP = <TextureRefCP>entity.getComponent('Polar:TextureRef');
			const textureLibCP = <TextureLibraryCP>this.getManager().getSingleton('Polar:TextureLibrary');
			Renderer.submitTextured(textureLibCP.library.get(textureCP.alias), (<TransformCP>entity.getComponent('Polar:Transform')).transform);
		}
		// Render physics bodies with TextureRef component.
		else if (subIndex == 3) {
			const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
			const textureCP = <TextureRefCP>entity.getComponent('Polar:TextureRef');
			const textureLibCP = <TextureLibraryCP>this.getManager().getSingleton('Polar:TextureLibrary');
			const texture = textureLibCP.library.get(textureCP.alias);
			Renderer.submitTextured(texture, createTransform(body.position[0], body.position[1], textureCP.width, textureCP.height, body.angle));
			console.log(`${body.position[0]}, ${body.position[1]}, ${texture.getWidth()}, ${texture.getWidth()}, ${body.angle}`);
		}
		// Render outline.
		else if (subIndex == 4) {
			const transform = (<TransformCP>entity.getComponent('Polar:Transform')).transform;
			const color = (<OutlineCP>entity.getComponent('Polar:Outline')).color;
			Renderer.submitColoredOutline(color, transform);
		}
	}

	public beginUpdate(dt: number): void {
		Renderer.beginScene((<CameraCP>this.getManager().getSingleton('Polar:Camera')).camera);
	}

	public endUpdate(dt: number): void {
		Renderer.endScene();
	}
}

export class OutlineCP extends Component {
	public readonly type = 'Polar:Wireframe';
	public color: glm.vec4;

	public constructor(color: glm.vec4 = glm.vec4.fromValues(1, 0, 0, 1)) {
		super();
		this.color = color;
	}
}
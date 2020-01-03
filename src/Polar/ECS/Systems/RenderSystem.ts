import * as glm from 'gl-matrix';
import { System } from '../System';
import { Entity } from '../Entity';
import { Component } from '../Component';
import { TextureRefCP, TextureLibraryCP } from '../Systems/TextureLoad';
import { Renderer } from '../../Renderer/Renderer';
import { Texture2DCP, TransformCP, CameraCP } from '../Components';
import { PhysicsBodyCP, BodyTextureAttachmentCP } from './Physics';
import { createTransform } from '../../Util/Math';
import { Event } from '../../Events/Event';

/** System which renders entities.
 * 
 * @system 'Polar:RenderSystem'
 * @tuples ['Polar:Transform', 'Polar:Texture2D'], ['Polar:PhysicsBody', 'Polar:Texture2D'], ['Polar:Transform', 'Polar:TextureRef'], ['Polar:PhysicsBody', 'Polar:TextureRef'], ['Polar:Transform', 'Polar:Outline']
 */
export class RenderSystem extends System {
	
	public onAttach(): void {}
	
	public getComponentTuples(): string[][] {
		return [
			['Polar:Transform', 'Polar:Texture2D'],
			['Polar:PhysicsBody', 'Polar:BodyTextureAttachment', 'Polar:Texture2D'],
			['Polar:Transform', 'Polar:TextureRef'],
			['Polar:PhysicsBody', 'Polar:BodyTextureAttachment', 'Polar:TextureRef'],
			['Polar:Transform', 'Polar:Outline']
		];
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
			const textureAttachment = <BodyTextureAttachmentCP>entity.getComponent('Polar:BodyTextureAttachment');
			const sin = Math.sin(body.angle);
			const cos = Math.cos(body.angle);
			Renderer.submitTextured(texture.texture, createTransform(
				body.position[0] + cos * textureAttachment.offsetX - sin * textureAttachment.offsetY, 
				body.position[1] + sin * textureAttachment.offsetX + cos * textureAttachment.offsetY, 
				body.angle + textureAttachment.rotation,
				textureAttachment.width, 
				textureAttachment.height
			));
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
			const textureAttachment = <BodyTextureAttachmentCP>entity.getComponent('Polar:BodyTextureAttachment');
			const texture = textureLibCP.library.get(textureCP.alias);
			const sin = Math.sin(body.angle);
			const cos = Math.cos(body.angle);
			Renderer.submitTextured(texture, createTransform(
				body.position[0] + cos * textureAttachment.offsetX - sin * textureAttachment.offsetY, 
				body.position[1] + sin * textureAttachment.offsetX + cos * textureAttachment.offsetY, 
				body.angle + textureAttachment.rotation,
				textureAttachment.width, 
				textureAttachment.height
			));
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
	
	public onEvent(event: Event): void {}
}

/**
 * Stores data about an entities outline. Entities with this component and a transform component will have a square outline rendered around them.
 * @component
 */
export class OutlineCP extends Component {
	public readonly type = 'Polar:Outline';
	/** The outline color. */
	public color: glm.vec4;

	/**
	 * Create a new outline component.
	 * @param {glm.vec4} [color=glm.vec4.fromValues(1, 0, 0, 1)] The outline color.
	 */
	public constructor(color: glm.vec4 = glm.vec4.fromValues(1, 0, 0, 1)) {
		super();
		this.color = color;
	}
}
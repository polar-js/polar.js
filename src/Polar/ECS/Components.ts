import * as glm from 'gl-matrix';
import { Component } from 'Polar/ECS/Component';
import { Texture2D } from 'Polar/Renderer/Texture';
import { OrthographicCamera } from 'Polar/Renderer/OrthographicCamera';
import { createTransform } from 'Polar/Util/Math';

/** Polar component which stores information about an entity's transform (position, rotation, scale).
 * 
 * @component 'Polar:Transform'
*/
export class TransformCP extends Component {

	public readonly type = 'Polar:Transform';
	public x: number = 0;
	public y: number = 0;
	public rotation: number = 0;
	public scale: number = 1;
	public modified: boolean = true;

	public transform: glm.mat4;

	/** Create a new transform component. */
	public constructor(x: number = 0, y: number = 0, rotation: number = 0, scale: number = 1) {
		super();
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		this.scale = scale;

		this.transform = createTransform(x, y, scale, scale, rotation, 0);
		this.modified = false;
	}


	// /**
	//  * Recalculate the transform component's transformation matrix.
	//  * To be called after editing position, rotation or scale.
	//  */
	// public recalculate(transformCP: TransformCP) {
	// 	this.transform = glm.mat4.create();
	// 	this.transform = glm.mat4.translate(this.transform, this.transform, glm.vec3.fromValues(this.x, this.y, 0));
	// 	this.transform = glm.mat4.rotate(this.transform, this.transform, this.rotation, glm.vec3.fromValues(0, 0, 1));
	// 	this.transform = glm.mat4.scale(this.transform, this.transform, glm.vec3.fromValues(this.scale, this.scale, this.scale));

	// 	this.modified = false;
	// }
}

/** A component which stores data about a 2D texture. 
 * 
 * @component 'Polar:Texture2D'
*/
export class Texture2DCP extends Component {

	public readonly type = 'Polar:Texture2D';
	public texture: Texture2D;
	public width: number;
	public height: number;

	public constructor(texture: Texture2D, width = 1, height = 1) {
		super();
		this.texture = texture;
		this.width = width;
		this.height = height;
	}
}

/** A component which stores a camera.
 * 
 * @component 'Polar:Camera'
 */
export class CameraCP extends Component {

	public readonly type = 'Polar:Camera';
	public camera: OrthographicCamera;
}
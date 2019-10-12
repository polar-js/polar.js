import { Component } from 'Polar/ECS/ECS';
import { Texture2D } from 'Polar/Renderer/Texture';
import { vec2, vec3, mat4 } from 'gl-matrix';
import { OrthographicCamera } from 'Polar/Renderer/Camera';

/** Polar component which stores information about an entity's transform (position, rotation, scale). */
export class TransformCP extends Component {

	public position: vec2;
	public rotation: number;
	public scale: number;

	public transform: mat4;

	/** Create a new transform component. */
	public constructor(position: vec2 = vec2.create(), rotation: number = 0, scale: number = 1) {
		super();
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;

		this.recalculateTransform();
	}

	public getType(): string { return 'Polar:Transform'; }

	/**
	 * Recalculate the transform component's transformation matrix.
	 * To be called after editing position, rotation or scale.
	 */
	public recalculateTransform() {
		this.transform = mat4.create();
		this.transform = mat4.translate(this.transform, this.transform, vec3.fromValues(this.position[0], this.position[1], 0));
		this.transform = mat4.rotate(this.transform, this.transform, this.rotation * Math.PI / 180, vec3.fromValues(0, 0, 1));
		this.transform = mat4.scale(this.transform, this.transform, vec3.fromValues(this.scale, this.scale, this.scale));
	}
}

export class Texture2DCP extends Component {

	public texture: Texture2D;

	public constructor(texture: Texture2D) {
		super();
		this.texture = texture;
	}

	public getType(): string { return 'Polar:Texture2D'; }
}

export class CameraCP extends Component {
	public camera: OrthographicCamera;

	public getType(): string { return 'Polar:Camera'; }
}

export class CameraControllerCP extends Component {
	public aspectRatio: number;
	public zoomLevel: number;

	public doRotation: boolean;

	// The camera's position in world space.
	public cameraPosition: vec3;
	// The camera's current rotation.
	public cameraRotation: number;
	// How fast the camera rotates in degrees per second.
	public cameraRotationSpeed: number;

	/**
	 * Create a new camera controller component.
	 * @param {number} [aspectRatio=1] The aspect ratio of the camera.
	 * @param {number} [zoomLevel=1] The initial zoom of the camera.
	 * @param {boolean} [doRotation=false] Allows the camera to be rotated using the Q and E keys.
	 * @param {vec3} [cameraPosition=vec3.create()] The initial position of the camera.
	 * @param {number} [cameraRotation=0.0] The initial rotation of the camera.
	 * @param {number} [cameraRotationSpeed=90.0] The rotation speed of the camera in degrees per second.
	 */
	public constructor(aspectRatio: number = 1, zoomLevel: number = 1, doRotation: boolean = false, cameraPosition = vec3.create(), cameraRotation = 0.0, cameraRotationSpeed = 90.0) {
		super();
		this.aspectRatio = aspectRatio;
		this.zoomLevel = zoomLevel;
		this.doRotation = doRotation;
		this.cameraPosition = cameraPosition;
		this.cameraRotation = cameraRotation;
		this.cameraRotationSpeed = cameraRotationSpeed;
	}

	public getType(): string { return 'Polar:CameraController'; }
}
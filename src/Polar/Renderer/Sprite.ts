import { vec2, vec3, mat4 } from 'gl-matrix';
import { Texture2D } from 'Polar/Renderer/Texture';

/** Represents a texture within world-space. */
export  class Sprite {
	private position: vec2;
	private rotation: number;
	private scale: number;
	private opacity: number;
	private texture: Texture2D;

	private transform: mat4;

	/**
	 * Create a new sprite.
	 * @param {Texture2D} [texture] The sprite's texture.
	 * @param {glm.vec2} [position] The sprite's position.
	 * @param {number} [rotation=0] The sprite's rotation in degrees.
	 * @param {number} [scale=1] The sprite's scale.
	 * @param {number} [opacity=1] The sprite's opacity (0 - 1).
	 */
	public constructor(texture: Texture2D = null, position: vec2 = vec2.create(), rotation: number = 0, scale: number = 1, opacity: number = 255) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.opacity = opacity;

		if (texture) {
			this.texture = texture;
		}
		else {
			this.texture = new Texture2D();
			this.texture.loadFromArray(new Uint8Array([100, 100, 100, 255]), 1, 1);
		}

		this.recalculateTransform();
	}

	public getPosition(): vec2 {
		return this.position;
	}

	public setPosition(position: vec2) {
		this.position = position;
		this.recalculateTransform();
	}

	public translateBy(deltaPosition: vec2) {
		vec2.add(this.position, this.position, deltaPosition);
		this.recalculateTransform();
	}

	public getRotation(): number {
		return this.rotation;
	}

	public setRotation(rotation: number) {
		this.rotation = rotation;
		this.recalculateTransform();
	}

	public rotateBy(deltaRotation: number) {
		this.rotation += deltaRotation;
		this.recalculateTransform();
	}

	public getScale(): number {
		return this.scale;
	}

	public setScale(scale: number) {
		this.scale = scale;
		this.recalculateTransform();
	}

	public scaleBy(deltaScale: number) {
		this.scale += deltaScale;
		this.recalculateTransform();
	}

	public getOpacity(): number {
		return this.opacity;
	}

	public setOpacity(opacity: number) {
		this.opacity = opacity;
	}

	public getTexture(): Texture2D {
		return this.texture;
	}

	public setTexture(texture: Texture2D) {
		this.texture = texture;
	}

	private recalculateTransform() {
		this.transform = mat4.create();
		this.transform = mat4.translate(this.transform, this.transform, vec3.fromValues(this.position[0], this.position[1], 0));
		this.transform = mat4.rotate(this.transform, this.transform, this.rotation * Math.PI / 180, vec3.fromValues(0, 0, 1));
		this.transform = mat4.scale(this.transform, this.transform, vec3.fromValues(this.scale, this.scale, this.scale));
	}

	public getTransform(): mat4 {
		return this.transform;
	}
}
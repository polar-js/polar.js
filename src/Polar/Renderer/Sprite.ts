import * as glm from 'gl-matrix';
import { Texture2D } from 'Polar/Renderer/Texture';

/** Represents a texture within world-space. */
export  class Sprite {
	/** The sprite's opacity. Unimplemented. */
	public opacity: number;

	private position: glm.vec2;
	private rotation: number;
	private scale: number;
	private texture: Texture2D;

	private transform: glm.mat4;

	/**
	 * Create a new sprite.
	 * @param {Texture2D} [texture] The sprite's texture.
	 * @param {glm.vec2} [position] The sprite's position.
	 * @param {number} [rotation=0] The sprite's rotation in radians.
	 * @param {number} [scale=1] The sprite's scale.
	 * @param {number} [opacity=1] The sprite's opacity (0 - 1).
	 */
	public constructor(texture: Texture2D = null, position: glm.vec2 = glm.vec2.create(), rotation: number = 0, scale: number = 1, opacity: number = 255) {
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

	/**
	 * Get the sprite's position in the world.
	 * @returns {glm.vec2} The position.
	 */
	public getPosition(): glm.vec2 {
		return this.position;
	}

	/**
	 * Set the sprite's position and recalculate transform.
	 * @param {glm.vec2} position The new position. 
	 */
	public setPosition(position: glm.vec2) {
		this.position = position;
		this.recalculateTransform();
	}

	/**
	 * Translate the sprite by a given vector.
	 * @param {glm.vec2} deltaPosition The amount to translate by.
	 */
	public translateBy(deltaPosition: glm.vec2) {
		glm.vec2.add(this.position, this.position, deltaPosition);
		this.recalculateTransform();
	}

	/**
	 * Get the sprite's rotation
	 * @returns {number}
	 */
	public getRotation(): number {
		return this.rotation;
	}

	/**
	 * Set the sprite's rotation and recalculate transform.
	 * @param {number} rotation The new rotation.
	 */
	public setRotation(rotation: number) {
		this.rotation = rotation;
		this.recalculateTransform();
	}

	/**
	 * Rotate a sprite by a given amount in radians and recalculate transform.
	 * @param deltaRotation The amount to rotate the sprite anticlockwise in radians.
	 */
	public rotateBy(deltaRotation: number) {
		this.rotation += deltaRotation;
		this.recalculateTransform();
	}

	/**
	 * Get the scale of the sprite.
	 * @returns {number}
	 */
	public getScale(): number {
		return this.scale;
	}

	/**
	 * Set the sprite's scale.
	 * @param {number} scale The new scale.
	 */
	public setScale(scale: number) {
		this.scale = scale;
		this.recalculateTransform();
	}

	/**
	 * Scale the sprite by a certain amount.
	 * @param {number} deltaScale The added scale.
	 */
	public scaleBy(deltaScale: number) {
		this.scale += deltaScale;
		this.recalculateTransform();
	}

	/**
	 * Get the sprite's texture.
	 * @returns {Texture2D} The texture.
	 */
	public getTexture(): Texture2D {
		return this.texture;
	}

	/**
	 * Set the sprite's texture.
	 * @param {Texture2D} texture The new texture.
	 */
	public setTexture(texture: Texture2D) {
		this.texture = texture;
	}

	/**
	 * Recalculate the sprite's transform.
	 */
	public recalculateTransform() {
		this.transform = glm.mat4.create();
		this.transform = glm.mat4.translate(this.transform, this.transform, glm.vec3.fromValues(this.position[0], this.position[1], 0));
		this.transform = glm.mat4.rotate(this.transform, this.transform, this.rotation, glm.vec3.fromValues(0, 0, 1));
		this.transform = glm.mat4.scale(this.transform, this.transform, glm.vec3.fromValues(this.scale, this.scale, this.scale));
	}

	/**
	 * Get the sprite's transform.
	 * @returns {glm.mat4}
	 */
	public getTransform(): glm.mat4 {
		return this.transform;
	}
}
import * as glm from 'gl-matrix';

/** Class representing an orthographic camera for use in a Polar scene. */
export class OrthographicCamera {
	private projectionMatrix: glm.mat4;
	private viewMatrix: glm.mat4;
	private viewProjectionMatrix: glm.mat4;

	private position: glm.vec3;
	private rotation: number;

	/**
	 * Create an orthographic camera.
	 * @param {number} left The left bound of the camera.
	 * @param {number} right The right bound of the camera.
	 * @param {number} bottom The bottom bound of the camera.
	 * @param {number} top The top bound of the camera.
	 * @param {glm.vec3} [position] The initial position of the camera.
	 * @param {number} [rotation] The initial rotation of the camera in radians.
	 */
	public constructor(left: number, right: number, bottom: number, top: number, position: glm.vec3 = glm.vec3.create(), rotation: number = 0) {
		this.viewMatrix = glm.mat4.create();
		this.projectionMatrix = glm.mat4.create();
		this.viewProjectionMatrix = glm.mat4.create();
		glm.mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
		this.position = position;
		this.rotation = rotation;

		this.recalculateViewMatrix();
	}

	/** Recalculates the camera's view projection matrix. */
	private recalculateViewMatrix() {
		let transform = glm.mat4.create();
		glm.mat4.translate(transform, transform, this.position);
		glm.mat4.rotate(transform, transform, this.rotation, [0, 0, 1]);

		glm.mat4.invert(this.viewMatrix, transform);
		glm.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
		const event = new CustomEvent('Polar:CameraTransform');
		window.dispatchEvent(event);
	}

	/**
	 * Get position of camera.
	 * @returns {glm.vec3} The camera's position in world space.
	 */
	public getPosition(): glm.vec3 {
		return this.position;
	}
	
	/**
	 * Set position of camera.
	 * @param {glm.vec3} position The new world space position for the camera.
	 */
	public setPosition(position: glm.vec3): void {
		this.position = position;
		this.recalculateViewMatrix();
	}

	/**
	 * Get rotation of camera.
	 * @returns {number} The camera's rotation in radians.
	 */
	public getRotation(): number {
		return this.rotation;
	}

	/**
	 * Set rotation of camera.
	 * @param {number} rotation The new rotation for the camera.
	 */
	public setRotation(rotation: number): void {
		this.rotation = rotation;
		this.recalculateViewMatrix();
	}

	/**
	 * Get camera's projection matrix.
	 * @returns The camera's projection matrix.
	 */
	public getProjectionMatrix(): glm.mat4 {
		return this.projectionMatrix;
	}

	/**
	 * Get camera's view matrix.
	 * @returns {glm.mat4} The camera's view matrix.
	 */
	public getViewMatrix(): glm.mat4 {
		return this.viewMatrix;
	}

	/**
	 * Get camera's view projection matrix.
	 * @returns {glm.mat4} The camera's view projection matrix.
	 */
	public getViewProjectionMatrix(): glm.mat4 {
		return this.viewProjectionMatrix;
	}

	/**
	 * Set camera's projection matrix.
	 * @param {number} left The left bound of the camera.
	 * @param {number} right The right bound of the camera.
	 * @param {number} bottom The bottom bound of the camera.
	 * @param {number} top The top bound of the camera.
	 */
	public setProjection(left: number, right: number, bottom: number, top: number): void {
		this.projectionMatrix = glm.mat4.create();
		this.viewProjectionMatrix = glm.mat4.create();
		glm.mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
		glm.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
		const event = new CustomEvent('Polar:CameraTransform');
		window.dispatchEvent(event);
	}
}
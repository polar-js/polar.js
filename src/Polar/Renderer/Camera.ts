import { vec3, mat4 } from 'gl-matrix';

/** Class representing an orthographic camera for use in a Polar scene. */
export  class OrthographicCamera {
	private projectionMatrix: mat4;
	private viewMatrix: mat4;
	private viewProjectionMatrix: mat4;

	private position: vec3;
	private rotation: number;

	/**
	 * Create an orthographic camera.
	 * @param {number} left The left bound of the camera.
	 * @param {number} right The right bound of the camera.
	 * @param {number} bottom The bottom bound of the camera.
	 * @param {number} top The top bound of the camera.
	 * @param {glm.vec3} [position] The initial position of the camera.
	 * @param {number} [rotation] The initial rotation of the camera in degrees.
	 */
	public constructor(left: number, right: number, bottom: number, top: number, position: vec3 = vec3.create(), rotation: number = 0) {
		this.viewMatrix = mat4.create();
		this.projectionMatrix = mat4.create();
		this.viewProjectionMatrix = mat4.create();
		mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
		this.position = position;
		this.rotation = rotation;

		this.recalculateViewMatrix();
	}

	/** Recalculates the camera's view projection matrix. */
	private recalculateViewMatrix() {
		let transform = mat4.create();
		mat4.translate(transform, transform, this.position);
		mat4.rotate(transform, transform, this.rotation * Math.PI / 180.0, [0, 0, 1]);

		mat4.invert(this.viewMatrix, transform);
		mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
		const event = new CustomEvent('Polar:CameraTransform');
		window.dispatchEvent(event);
	}

	/**
	 * Get position of camera.
	 * @returns {glm.vec3} The camera's position in world space.
	 */
	public getPosition(): vec3 {
		return this.position;
	}
	
	/**
	 * Set position of camera.
	 * @param {glm.vec3} position The new world space position for the camera.
	 */
	public setPosition(position: vec3): void {
		this.position = position;
		this.recalculateViewMatrix();
	}

	/**
	 * Get rotation of camera.
	 * @returns {number} The camera's rotation in degrees.
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
	public getProjectionMatrix(): mat4 {
		return this.projectionMatrix;
	}

	/**
	 * Get camera's view matrix.
	 * @returns {glm.mat4} The camera's view matrix.
	 */
	public getViewMatrix(): mat4 {
		return this.viewMatrix;
	}

	/**
	 * Get camera's view projection matrix.
	 * @returns {glm.mat4} The camera's view projection matrix.
	 */
	public getViewProjectionMatrix(): mat4 {
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
		this.projectionMatrix = mat4.create();
		this.viewProjectionMatrix = mat4.create();
		mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
		mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
		const event = new CustomEvent('Polar:CameraTransform');
		window.dispatchEvent(event);
	}
}
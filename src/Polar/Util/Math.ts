import * as glm from 'gl-matrix';

/**
 * Generate a transformation matrix.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {number} width The width to scale by.
 * @param {number} height The height to scale by.
 * @param {number} rotation The rotation.
 * @param {number} zIndex The z index of the object.
 * @returns {glm.mat4} The transformation matrix.
 */
export function createTransform(x: number = 0, y: number = 0, width: number = 1, height: number = 1, rotation: number = 0, zIndex: number = 0): glm.mat4 {
	let transform = glm.mat4.create();
	transform = glm.mat4.translate(transform, transform, glm.vec3.fromValues(x, y, zIndex));
	transform = glm.mat4.rotate(transform, transform, rotation, glm.vec3.fromValues(0, 0, 1));
	transform = glm.mat4.scale(transform, transform, glm.vec3.fromValues(width, height, 1));
	return transform;
}
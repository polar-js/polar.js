import { vec3, mat4 } from 'gl-matrix';

/**
 * Generate a transformation matrix.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {number} width The width to scale by.
 * @param {number} height The height to scale by.
 * @param {number} rotation The rotation.
 * @param {number} zIndex The z index of the object.
 * @returns {mat4} The transformation matrix.
 */
export function createTransform(x: number = 0, y: number = 0, width: number = 1, height: number = 1, rotation: number = 0, zIndex: number = 0): mat4 {
	let transform = mat4.create();
	transform = mat4.translate(transform, transform, vec3.fromValues(x, y, zIndex));
	transform = mat4.rotate(transform, transform, rotation * Math.PI / 180, vec3.fromValues(0, 0, 1));
	transform = mat4.scale(transform, transform, vec3.fromValues(width, height, 1));
	return transform;
}
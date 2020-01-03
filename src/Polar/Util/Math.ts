import * as glm from 'gl-matrix';

/**
 * Generate a transformation matrix.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {number} rotation The rotation.
 * @param {number} width The width to scale by.
 * @param {number} height The height to scale by.
 * @param {number} zIndex The z index of the object.
 * @returns {glm.mat4} The transformation matrix.
 */
export function createTransform(x: number = 0, y: number = 0, rotation: number = 0, width: number = 1, height: number = 1, zIndex: number = 0): glm.mat4 {
	let transform = glm.mat4.create();
	transform = glm.mat4.translate(transform, transform, glm.vec3.fromValues(x, y, zIndex));
	transform = glm.mat4.rotate(transform, transform, rotation, glm.vec3.fromValues(0, 0, 1));
	transform = glm.mat4.scale(transform, transform, glm.vec3.fromValues(width, height, 1));
	return transform;
}

export function makeVec2(x: number = 0, y: number = 0): glm.vec2 {
	return glm.vec2.fromValues(x, y);
}

export function makeVec3(x: number = 0, y: number = 0, z: number = 0): glm.vec3 {
	return glm.vec3.fromValues(x, y, z);
}

export function makeVec4(x: number = 0, y: number = 0, z: number = 0, w: number = 0): glm.vec4 {
	return glm.vec4.fromValues(x, y, z, w);
}
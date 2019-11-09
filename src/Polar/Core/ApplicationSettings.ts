import * as glm from 'gl-matrix';

/** Settings for creating a new application. */
export interface ApplicationSettings {
	/** The ID of the HTMLCanvasElement. */
	canvasID: string;
	/** The display mode of the game engine.
	 * @remarks
	 * Can be 'fixed' or 'fill'.
	 */
	displayMode: string;
	/** The width of the display surface. */
	width: number;
	/** The height of the display surface. */
	height: number;
	/** The background color of the surface. */
	clearColor: glm.vec3;
}
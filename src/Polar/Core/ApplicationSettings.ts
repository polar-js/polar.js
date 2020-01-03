import * as glm from 'gl-matrix';

/** Settings for creating a new application. */
export class ApplicationSettings {
	/** The ID of the HTMLCanvasElement. */
	public canvasID: string;
	/** The display mode of the game engine.
	 * 
	 * Can be 'fixed' or 'fill'.
	 */
	public displayMode: string;
	/** The width of the display surface. */
	public width: number;
	/** The height of the display surface. */
	public height: number;
	/** The background color of the surface. */
	public clearColor: glm.vec3 = glm.vec3.fromValues(0.1, 0.1, 0.1);
	/** Whether the context menu appears when the user right clicks on the canvas. */
	public allowContextMenu: boolean = false;
}
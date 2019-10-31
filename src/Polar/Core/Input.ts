import * as glm from 'gl-matrix';

export class Input {
	private static keyStates: {[id: string]: boolean};
	private static mouseButtonStates: {[id: number]: boolean};
	private static mousePosition: glm.vec2;
	
	public static init() {
		this.keyStates = {};
		this.mouseButtonStates = {};
		this.mousePosition = glm.vec2.create();
		
		window.addEventListener('keydown', (ev: KeyboardEvent) => {
			this.keyStates[ev.key] = true;
		});

		window.addEventListener('keyup', (ev: KeyboardEvent) => {
			this.keyStates[ev.key] = false;
		});

		window.addEventListener('mousedown', (ev: MouseEvent) => {
			this.mouseButtonStates[ev.button] = true;
		});

		window.addEventListener('mouseup', (ev: MouseEvent) => {
			this.mouseButtonStates[ev.button] = false;
		});

		window.addEventListener('mousemove', (ev: MouseEvent) => {
			this.mousePosition[0] = ev.pageX;
			this.mousePosition[1] = ev.pageY;
		});
	}

	/**
	 * Get the state of a key.
	 * @param {string} key The name of the key.
	 * @returns {boolean} The state of the key. DOWN = true, UP = false.
	 */
	public static isKeyPressed(key: string): boolean {
		return this.keyStates[key] == null ? false : this.keyStates[key];
	}

	/**
	 * Get the state of a mouse button.
	 * @param {number} button The index of the mouse button
	 * @returns {boolean} The state of the mouse button. DOWN = true, UP = false.
	 */
	public static isMouseButtonPressed(button: number): boolean {
		return this.mouseButtonStates[button] == null ? false : this.mouseButtonStates[button];
	}

	/**
	 * Get the mouse position within the page.
	 * @returns {glm.vec2} The position of the mouse within the page.
	 */
	public static getMousePosition(): glm.vec2 {
		return this.mousePosition;
	}
}
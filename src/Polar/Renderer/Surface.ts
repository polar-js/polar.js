import * as glm from 'gl-matrix';
import { ApplicationSettings } from 'Polar/Core/ApplicationSettings';
import { RenderCommand } from './RenderCommand';

// TODO: Make gl external to surface?
//export var gl: WebGL2RenderingContext;

export class Surface {

	private static settings: ApplicationSettings;

	/** The engine's main rendering canvas. */
	public static canvas: HTMLCanvasElement;
	private static fontCanvas: HTMLCanvasElement;

	/**
	 * The WebGL2 rendering context.
	 * @static
	 */
	public static gl: WebGL2RenderingContext;
	
	/**
	 * The font rendering context.
	 * @static
	 */
	public static font: CanvasRenderingContext2D;

	private static resizing: boolean = false;

	/** 
	 * Initialize the surface.
	 * @param {settings} settings The engine settings.
	 */
	public static init(settings: ApplicationSettings) {
		this.settings = settings;
		if (!this.settings.clearColor) this.settings.clearColor = glm.vec3.fromValues(0.1, 0.1, 0.1);

		// CREATE WEBGL CANVAS //
		if (this.settings.canvasID) {
			this.canvas = <HTMLCanvasElement> document.getElementById(this.settings.canvasID);
		}
		else {
			this.canvas = document.createElement('canvas');
			document.getElementsByTagName('body')[0].appendChild(this.canvas);
		}

		if (this.settings.displayMode == 'fill') {
			this.canvas.style.width = '100%';
			this.canvas.style.height = '100%';
			this.canvas.width = this.canvas.parentElement.offsetWidth;
			this.canvas.height = this.canvas.parentElement.offsetHeight;
		}
		else if (this.settings.displayMode == 'fixed' && this.settings.canvasID) {
			this.canvas.width = this.settings.width || 780;
			this.canvas.height = this.settings.height || 480;
		}
		this.gl = this.canvas.getContext('webgl2');

		// CREATE FONT CANVAS //
		this.fontCanvas = document.createElement('canvas');
		if (this.canvas.nextSibling) {
			this.canvas.parentNode.insertBefore(this.fontCanvas, this.canvas.nextSibling);
		  }
		  else {
			this.canvas.parentNode.appendChild(this.fontCanvas);
		  }
		this.fontCanvas.style.position = 'absolute';
		this.fontCanvas.style.left =  this.canvas.offsetLeft.toString() + 'px';
		this.fontCanvas.style.top = this.canvas.offsetTop.toString() + 'px';
		this.fontCanvas.width = this.canvas.width;
		this.fontCanvas.height = this.canvas.height;

		this.font = this.fontCanvas.getContext('2d');
		
		var timeout: number = null;
		window.addEventListener('resize', (ev: UIEvent) => {
			this.resizing = true;
			console.log('Resizing true...');
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
				this.resizing = false;
				console.log('Resizing false...');
			}, 100);

			if (this.settings.displayMode == 'fill') {
				this.canvas.width = this.canvas.parentElement.offsetWidth;
				this.canvas.height = this.canvas.parentElement.offsetHeight;
			}

			this.fontCanvas.style.left =  this.canvas.offsetLeft.toString() + 'px';
			this.fontCanvas.style.top = this.canvas.offsetTop.toString() + 'px';
			this.fontCanvas.width = this.canvas.width;
			this.fontCanvas.height = this.canvas.height;
		});
		
		RenderCommand.setClearColor(glm.vec4.fromValues(this.settings.clearColor[0], this.settings.clearColor[1], this.settings.clearColor[2], 1.0));
	}

	/** Get the font canvas element.
	 * @returns {HTMLCanvasElement} The canvas.
	 */
	public static getFontCanvas(): HTMLCanvasElement {
		return this.fontCanvas;
	}

	/**
	 * Resize the canvas.
	 * @param {number} width The new width of the canvas.
	 * @param {number} height The new height of the canvas. 
	 */
	public static resize(width: number, height: number) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.fontCanvas.width = width;
		this.fontCanvas.height = height;
	}

	public static isResizing(): boolean {
		return this.resizing;
	}

	/** Get the width of the rendering surface.
	 * @returns {number} The width.
	 */
	public static getWidth(): number {
		return this.canvas.width;
	}

	/** Get the height of the rendering surface.
	 * @returns {number} The height.
	*/
	public static getHeight(): number {
		return this.canvas.height;
	}

	public static clear(color?: glm.vec4) {
		RenderCommand.setClearColor(color ? color : glm.vec4.fromValues(this.settings.clearColor[0], this.settings.clearColor[1], this.settings.clearColor[2], 1.0));
		RenderCommand.clear();
	}
}
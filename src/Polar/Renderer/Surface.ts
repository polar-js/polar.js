import * as glm from 'gl-matrix';
import { ApplicationSettings } from 'Polar/Core/ApplicationSettings';
import { RenderCommand } from './RenderCommand';

export class Surface {
	private static canvas: HTMLCanvasElement;
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

	/** 
	 * Initialize the canvas.
	 * @param {settings} settings The engine settings.
	 */
	public static init(settings: ApplicationSettings) {

		// CREATE WEBGL CANVAS //
		if (settings.canvasID) {
			this.canvas = <HTMLCanvasElement> document.getElementById(settings.canvasID);
		}
		else {
			this.canvas = document.createElement('canvas');
			document.getElementsByTagName('body')[0].appendChild(this.canvas);
		}

		if (settings.displayMode == 'fill') {
			this.canvas.style.width = '100%';
			this.canvas.style.height = '100%';
			this.canvas.width = this.canvas.parentElement.offsetWidth;
			this.canvas.height = this.canvas.parentElement.offsetHeight;
		}
		else if (settings.displayMode == 'fixed' && settings.canvasID) {
			this.canvas.width = settings.width || 780;
			this.canvas.height = settings.height || 480;
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

		window.addEventListener('resize', (ev: UIEvent) => {
			if (settings.displayMode == 'fill') {
				this.canvas.width = this.canvas.parentElement.offsetWidth;
				this.canvas.height = this.canvas.parentElement.offsetHeight;
			}

			this.fontCanvas.style.left =  this.canvas.offsetLeft.toString() + 'px';
			this.fontCanvas.style.top = this.canvas.offsetTop.toString() + 'px';
			this.fontCanvas.width = this.canvas.width;
			this.fontCanvas.height = this.canvas.height;

			this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		});
		
		if (settings.clearColor && settings.clearColor.length >= 3)
			RenderCommand.setClearColor(glm.vec4.fromValues(settings.clearColor[0], settings.clearColor[1], settings.clearColor[2], 1.0));
		else
			RenderCommand.setClearColor(glm.vec4.fromValues(0.1, 0.1, 0.1, 1.0));
	}

	/**
	 * Get the html canvas element.
	 * @returns {HTMLCanvasElement} The canvas.
	 */
	public static get(): HTMLCanvasElement {
		return this.canvas;
	}

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

	public static getWidth(): number {
		return this.canvas.width;
	}

	public static getHeight(): number {
		return this.canvas.height;
	}
}
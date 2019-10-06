import Settings from "Polar/Core/Settings";

export default class Canvas {
    private static canvas: HTMLCanvasElement;

    /**
     * The WebGL2 rendering context.
     * @static
     */
    public static gl: WebGL2RenderingContext;

    /** 
     * Initialise the canvas.
     * @param {settings} settings The engine settings.
     */
    public static init(settings: Settings) {
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

        window.addEventListener('resize', (ev: UIEvent) => {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        });
    }

    /**
     * Get the html canvas element.
     * @returns {HTMLCanvasElement} The canvas.
     */
    public static get(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Resize the canvas.
     * @param {number} width The new width of the canvas.
     * @param {number} height The new height of the canvas. 
     */
    public static resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
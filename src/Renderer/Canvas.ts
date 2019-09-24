import Settings from "Settings";

class Canvas {
    private static canvas: HTMLCanvasElement;
    public static gl: WebGL2RenderingContext;

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

    public static get(): HTMLCanvasElement {
        return this.canvas;
    }

    public static resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

export default Canvas;
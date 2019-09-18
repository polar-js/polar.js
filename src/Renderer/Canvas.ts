
class Canvas {
    private static canvas: HTMLCanvasElement;
    public static gl: WebGL2RenderingContext;

    public static init(canvasName: string) {
        this.canvas = <HTMLCanvasElement> document.getElementById(canvasName);
        this.gl = this.canvas.getContext('webgl2');
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
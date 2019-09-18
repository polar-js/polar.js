import Layer from "./Layer"
import LayerStack from "./LayerStack"

abstract class Application {
    private lastFrameTime: number = 0;
    private layerStack: LayerStack;
    private frameID: number;

    public constructor() {
        this.layerStack = new LayerStack();
        this.lastFrameTime = 0;
    }

    public start(): void {
        const update = (time: DOMHighResTimeStamp) => {
            const deltaTime = (time - this.lastFrameTime) / 10e6;
            this.lastFrameTime = time;

            // TODO: Clear renderer.

            this.layerStack.onUpdate(deltaTime);

            this.frameID = window.requestAnimationFrame(update);
        }

        this.frameID = window.requestAnimationFrame(update);
    }

    public stop() {
        console.assert(this.frameID, "Application has not begun!");
        window.cancelAnimationFrame(this.frameID);
    }

    private update(time: DOMHighResTimeStamp): void {
        
    }

    public pushLayer(layer: Layer): void {
        this.layerStack.pushLayer(layer);
        layer.onAttach();
    }

    public pushOverlay(layer: Layer): void {
        this.layerStack.pushOverlay(layer);
        layer.onAttach();
    }
}

export default Application;
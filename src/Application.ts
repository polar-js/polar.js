import Layer from "./Layer"
import LayerStack from "./LayerStack"
import RenderCommand from "./Renderer/RenderCommand";
import Renderer from "./Renderer/Renderer";
import { vec4 } from "gl-matrix";
import Canvas from "./Renderer/Canvas";
import Input from './Input';

abstract class Application {
    private lastFrameTime: number = 0;
    private layerStack: LayerStack;
    private frameID: number;

    public constructor(canvasid: string) {
        this.layerStack = new LayerStack();
        this.lastFrameTime = 0;

        Canvas.init(canvasid);
        Input.init();
        Renderer.init();
    }

    public start(): void {
        const update = (_: DOMHighResTimeStamp) => {
            const time = performance.now();
            const deltaTime = (time - this.lastFrameTime) / 1000;
            this.lastFrameTime = time;

            const color = vec4.create();
            color.set([0.1, 0.1, 0.1, 1.0]);
            RenderCommand.setClearColor(color);
            RenderCommand.clear();

            this.layerStack.onUpdate(deltaTime);

            this.frameID = window.requestAnimationFrame(update);
        }

        this.frameID = window.requestAnimationFrame(update);
    }

    public stop() {
        console.assert(this.frameID != null, "Application has not begun!");
        window.cancelAnimationFrame(this.frameID);
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
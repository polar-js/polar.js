

abstract class Application {
    private isRunning: boolean;
    private lastFrameTime: number;

    constructor() {
        this.isRunning = false;
    }

    public run() {
        this.isRunning = true;
        while (this.isRunning) {
            const time = performance.now();
            const deltaTime = time - this.lastFrameTime;
            this.lastFrameTime = time;


        }
    }

    public pushLayer(layer: Layer): void {

    }
}

export { Application };
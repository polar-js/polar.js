import { Application } from "./Application";

class Engine {
    private application: Application;

    constructor(canvasid: string, app: Application) {
        this.application = app;
    }

    run(): void {
        this.application.run();
    }
}

export { Engine, Application };
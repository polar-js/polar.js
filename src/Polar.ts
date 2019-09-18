import { Application } from "./Application";

class Engine {
    private application: Application;

    constructor(canvasid: string, app: Application) {
        this.application = app;

        this.application.OnLoad();
    }
}

export { Engine, Application };
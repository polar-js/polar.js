import { Application } from "./Application";

class Polar {
    private m_Application: Application;

    constructor(canvasid: string, app: Application) {
        this.m_Application = app;
    }
}

export { Polar, Application };
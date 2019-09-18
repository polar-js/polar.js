import Application from "./Application";
import Layer from "./Layer";

let application: Application;

function create(app: Application) {
    application = app;
    application.start();
}

function stop() {
    application.stop();
}

export { create, Application, Layer };
class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");

    }

    onUpdate(deltaTime) {

    }
}

class Sandbox extends Polar.Application {
    constructor(canvasid) {
        super(canvasid);
        this.pushLayer(new ExampleLayer());
    }
}

Polar.create(new Sandbox('polar-canvas'));
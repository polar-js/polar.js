class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");

    }

    onUpdate(deltaTime) {

    }
}

class Sandbox extends Polar.Application {
    constructor() {
        super();
        this.pushLayer(new ExampleLayer());
    }
}

Polar.create('polar-canvas', new Sandbox());
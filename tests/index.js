
class Sandbox extends Application {
    constructor() {
        super();
        console.log('Created sandbox!');
    }
}

const engine = Polar.Create("test-canvas", new Sandbox());


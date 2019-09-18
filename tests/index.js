class Sandbox extends Polar.Application {
    constructor() {
        super();
        console.log('Created sandbox!');
    }

    OnLoad() {
        console.log('sandbox on load');
    }
}

const engine = new Polar.Engine('polar-canvas', new Sandbox());
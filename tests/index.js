class Sandbox extends Polar.Application {
    constructor() {
        super();
        console.log('Created sandbox!');
    }
}

const engine = Polar.Polar.Create('polar-canvas', new Sandbox());


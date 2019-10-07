class ExampleLayer extends Polar.Layer {
    constructor() {
        super("example");
        const checkerboard = new Polar.Texture2D();
        checkerboard.loadFromPath('checkerboard.png');
        this.checkerboardSprite = new Polar.Sprite(checkerboard);
        
        this.timeElapsed = 0;
        this.cameraController = new Polar.OrthographicCameraController(Polar.Canvas.get().offsetWidth / Polar.Canvas.get().offsetHeight);
        this.ready = true;
    }

    onUpdate(deltaTime) {
        // Update
        this.cameraController.onUpdate(deltaTime);

        // Render
        Polar.Renderer.beginScene(this.cameraController.getCamera());

        Polar.Renderer.submit(this.checkerboardSprite);

        Polar.Renderer.endScene();
    }
}

class Sandbox extends Polar.Application {
    constructor(canvasid) {
        super(canvasid);
        this.pushLayer(new ExampleLayer());
    }
}

if (window.location.protocol == 'file:') {
    document.writeln('Error: Must be run in http-server to allow file access.');
} else {
    Polar.create(new Sandbox({displayMode: 'fill'}));
}
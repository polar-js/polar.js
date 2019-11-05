class Sandbox extends Polar.Application {
	constructor(settings) {
		super(settings);
		this.pushLayer(new InstancedRenderingLayer());
	}
}

if (window.location.protocol == 'file:') {
	document.writeln('Error: Must be run in http-server to allow file access.');
} else {
	Polar.create(new Sandbox({ canvasID: 'test-canvas', displayMode: 'fill' }));
}
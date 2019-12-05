class Sandbox extends Polar.Application {
	constructor(settings) {
		super(settings);
		this.pushLayer(new ECSFromFileLayer());
	}
}

if (window.location.protocol == 'file:') {
	document.writeln('Error: Must be run in http-server to allow file access.');
} else {
	Polar.begin(new Sandbox({ canvasID: 'test-canvas', displayMode: 'fill' }));
}
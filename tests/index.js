class Sandbox extends Polar.Application {
	constructor(canvasId) {
		super(canvasId);
		this.pushLayer(new ExampleECSLayer());
	}
}

if (window.location.protocol == 'file:') {
	document.writeln('Error: Must be run in http-server to allow file access.');
} else {
	Polar.create(new Sandbox({displayMode: 'fill'}));
}
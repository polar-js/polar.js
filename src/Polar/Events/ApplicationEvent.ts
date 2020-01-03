import { Event } from './Event';

export class CanvasResizeEvent extends Event {

	public readonly width: number;
	public readonly height: number;

	constructor(width: number, height: number) {
		super();
		this.width = width;
		this.height = height;
	}

	public getEventType(): string {
		return 'Polar:CanvasResizeEvent';
	}
	
	public toString(): string {
		return `Polar:CanvasResizeEvent - width: ${this.width}, height: ${this.height}`;
	}
}

export class CanvasFocusEvent extends Event {
	
	public getEventType(): string {
		return 'Polar:CanvasFocusEvent';
	}
	
	public toString(): string {
		return 'Polar:CanvasFocusEvent';
	}
}

export class CanvasUnfocusEvent extends Event {
	
	public getEventType(): string {
		return 'Polar:CanvasUnfocusEvent';
	}
	
	public toString(): string {
		return 'Polar:CanvasUnfocusEvent';
	}
}
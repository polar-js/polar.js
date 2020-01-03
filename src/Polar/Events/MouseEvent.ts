import { Event } from './Event';

export abstract class MouseEvent extends Event {
	public readonly mouseX: number;
	public readonly mouseY: number;

	public constructor(mouseX: number, mouseY: number) {
		super();
		this.mouseX = mouseX;
		this.mouseY = mouseY;
	}
}

export class MouseMoveEvent extends MouseEvent {

	public constructor(mouseX: number, mouseY: number) {
		super(mouseX, mouseY);
	}

	public getEventType(): string {
		return 'Polar:MouseMoveEvent';
	}

	public toString(): string {
		return `Polar:MouseMoveEvent - x: ${this.mouseX}, y: ${this.mouseY}`;
	}
}

export class MouseWheelEvent extends MouseEvent {
	public readonly deltaX: number;
	public readonly deltaY: number;

	public constructor(mouseX: number, mouseY: number, deltaX: number, deltaY: number) {
		super(mouseX, mouseY);
		this.deltaX = deltaX;
		this.deltaY = deltaY;
	}

	public getEventType(): string {
		return 'Polar:MouseWheelEvent';
	}

	public toString(): string {
		return `Polar:MouseWheelEvent - offset (${this.deltaX}, ${this.deltaY}), position: (${this.mouseX}, ${this.mouseY})`;
	}
}

export class MouseDownEvent extends MouseEvent {

	public readonly button: number;

	public constructor(mouseX: number, mouseY: number, button: number) {
		super(mouseX, mouseY);
		this.button = button;
	}

	public getEventType(): string {
		return 'Polar:MouseDownEvent';
	}

	public toString(): string {
		return `Polar:MouseDownEvent - mouse button: ${this.button}, position: (${this.mouseX}, ${this.mouseY})`;
	}
}

export class MouseUpEvent extends MouseEvent {

	public readonly button: number;

	public constructor(mouseX: number, mouseY: number, button: number) {
		super(mouseX, mouseY);
		this.button = button;
	}

	public getEventType(): string {
		return 'Polar:MouseUpEvent';
	}

	public toString(): string {
		return `Polar:MouseUpEvent - mouse button: ${this.button}, position: (${this.mouseX}, ${this.mouseY})`;
	}
}
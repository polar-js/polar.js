import { Event } from './Event';

export abstract class KeyEvent extends Event {

	public constructor() {
		super();
	}

	public getKeyCode(): string {
		return this.key;
	}

	protected key: string;
}

export class KeyDownEvent extends KeyEvent {

	public constructor(keycode: string) {
		super();
		this.key = keycode;
	}
	
	public getEventType(): string {
		return 'Polar:KeyPressedEvent';
	}
	
	public toString(): string {
		return `Polar:KeyPressedEvent - keycode: ${this.key}`;
	}
}

export class KeyUpEvent extends KeyEvent {

	public constructor(keycode: string) {
		super();
		this.key = keycode;
	}

	public getEventType(): string {
		return 'Polar:KeyUpEvent';
	}

	public toString(): string {
		return `Polar:KeyUpEvent - keycode: ${this.key}`;
	}
}
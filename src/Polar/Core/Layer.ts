
export class Layer {
	private debugName: string;

	public constructor(name: string) {
		this.debugName = name;
	}

	public onAttach(): void {}
	public onDetach(): void {}
	public onUpdate(deltaTime: number): void {}
	public onEvent(): void {}

	public getName(): string { 
		return this.debugName;
	}
}
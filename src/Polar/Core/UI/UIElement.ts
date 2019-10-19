

class UIElement {
	public children: [UIElement];

	public dx: Constraint;
	public dy: Constraint;

	public width: Constraint;
	public height: Constraint;
	
	public constructor() {
		
	}
}

class Constraint {
	
	public amount: number;
	
	// 'px', '%'
	public type: string;

	public constructor(amount: number = 0, type: string = 'px') {
		this.amount = amount;
		this.type = type;
	}
}
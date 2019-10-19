

class UIElement {
	public children: [UIElement];

	public left: Constraint;
	public right: Constraint;
	public top: Constraint;
	public bottom: Constraint;

	public width: Constraint;
	
	public constructor() {
		
	}
}

class Constraint {
	
	public amount: number;
	
	// 'px', '%'
	public type: string;
	
	public relativeTo: UIElement;

	public constructor(amount: number = 0, type: string = 'px', relativeTo?: UIElement) {
		this.amount = amount;
		this.type = type;
		this.relativeTo = relativeTo;
	}
}
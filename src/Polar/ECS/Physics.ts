import * as p2 from 'p2';
import { System, Component } from 'Polar/ECS/ECS';

export class PhysicsSystem extends System {

	public onAttach() {

	}

	public onDetach() {}

	public beginUpdate(dt: number) {
		if (dt < 0.2)
			(<PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld')).world.step(dt, null, 3);
	}

	public onEntityUpdate() {

	}

	public endUpdate(dt: number) {}

	public getComponentTuples(): string[][] {
		return [];
	}

	public getName(): string {
		return 'Polar:PhysicsSystem';
	}
}

export class PhysicsBodyCP extends Component {

	public body: p2.Body;

	/**
	 * Create a p2 body component.
	 * @param {p2.Body} body The p2 body.
	 * @param {p2.World} [world] The world which the body is added to (If null, body will not be added to world).
	 */
	public constructor(body: p2.Body, world?: p2.World) {
		super();
		this.body = body;
		if (world)
			world.addBody(this.body);
	}

	public getType(): string {
		return 'Polar:PhysicsBody';
	}
}

/** A singleton component which represents a p2 physics world. */
export class PhysicsWorldCP extends Component {

	public world: p2.World;

	/**
	 * Create a new physics world singleton component
	 * @param {p2.WorldOptions} [settings] The world settings.
	 */
	public constructor(settings?: p2.WorldOptions) {
		super();
		this.world = new p2.World(settings);
	}

	public getType(): string {
		return 'Polar:PhysicsWorld';
	}
}
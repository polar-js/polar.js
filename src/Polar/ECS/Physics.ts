import * as p2 from 'p2';
import { System, Component, Entity } from 'Polar/ECS/ECS';
import { Renderer } from 'Polar/Renderer/Renderer';
import { vec2, vec4, mat4, vec3 } from 'gl-matrix';
import { createTransform } from 'Polar/Util/Math';
import { Input } from 'Polar/Core/Input';

export class PhysicsSystem extends System {

	public onAttach() {}

	public onDetach() {}

	public beginUpdate(dt: number) {
		const systemData = <PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld');
		if (dt < 0.2) 
			systemData.world.step(dt, null, 3);
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {

	}

	public endUpdate(dt: number) {}

	public getComponentTuples(): string[][] { return []; }

	public getName(): string { return 'Polar:PhysicsSystem'; }
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

export class PhysicsDebugRenderSystem extends System {
	public onAttach(): void {}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {
		const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
		// Render shapes...
		for (const shape of body.shapes) {
			if (shape.type == p2.Shape.BOX || shape.type == p2.Shape.CONVEX) {
				const box = <p2.Box>shape;
				Renderer.submitColoredOutline(vec4.fromValues(0.9, 0.1, 0.9, 1.0), 
					createTransform(body.position[0] + box.position[0], body.position[1] + box.position[1], 
						box.width, box.height, (body.angle + box.angle) * 180 / Math.PI, 0));
				Renderer.submitLine(body.position[0] + box.position[0], body.position[1] + box.position[1],
					body.position[0] + box.position[0] + box.width / 2 * Math.cos(body.angle + box.angle), 
					body.position[1] + box.position[1] + box.width / 2 * Math.sin(body.angle + box.angle), 
					vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
			}
			else if (shape.type == p2.Shape.CIRCLE) {
				const circle = <p2.Circle>shape;
				Renderer.submitCircle(body.position[0] + circle.position[0], body.position[1] + circle.position[1], circle.radius, vec4.fromValues(0.9, 0.1, 0.9, 1.0));
				Renderer.submitLine(body.position[0] + circle.position[0], body.position[1] + circle.position[1], 
					body.position[0] + circle.position[0] + circle.radius * Math.cos(body.angle + circle.angle), 
					body.position[1] + circle.position[1] + circle.radius * Math.sin(body.angle + circle.angle),
					vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
			}
			else if (shape.type == p2.Shape.LINE) {
				const line = <p2.Line>shape;
				Renderer.submitLine(line.position[0], line.position[1], 
					line.position[0] + line.length * Math.cos(body.angle + line.angle), 
					line.position[1] + line.length * Math.sin(body.angle + line.angle), 
					vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
			}
		}
	}

	public beginUpdate(dt: number) {}

	public endUpdate(dt: number) {}

	public getComponentTuples(): string[][] {
		return [['Polar:PhysicsBody']];
	}

	public getName(): string {
		return 'Polar:PhysicsDebugRendererSystem';
	}
}

export class PhysicsDebugInteractionSystem extends System {

	public onAttach(): void {
		(<PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction')).nullBody = new p2.Body({mass: 0});
		(<PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction')).nullBody.collisionResponse = false;
		(<PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld')).world.islandSplit = false;

		window.addEventListener('mousedown', (ev: MouseEvent) => {
			if (ev.button === 0) {
				(<PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction')).doClick = true;
			}
		});

		window.addEventListener('mousemove', (ev: MouseEvent) => {
			this.updatePosition();
		});

		window.addEventListener('Polar:CameraTransform', (ev: CustomEvent) => {
			this.updatePosition();
		});

		window.addEventListener('mouseup', (ev: MouseEvent) => {
			if (ev.button === 0) {
				const info = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
				const world = (<PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld')).world;
				world.removeConstraint(info.constraint);
				info.constraint = null;
				info.currentBody = null;
			}
		});
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {

	}

	public beginUpdate(dt: number) {}

	public checkQuadrant() {
		const systemData = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
		let x: number;
		let y: number;
		let quadrant: number;
		if ((systemData.nullBody.position[0]-systemData.currentBody.position[0])*Math.cos(systemData.currentBody.angle)+(systemData.nullBody.position[1]-systemData.currentBody.position[1])*Math.sin(systemData.currentBody.angle) >= 0) {
			x = 1;
		}
		else {
			x = -1; 
		}
		if ((systemData.nullBody.position[1]-systemData.currentBody.position[1])*Math.cos(systemData.currentBody.angle)-(systemData.nullBody.position[0]-systemData.currentBody.position[0])*Math.sin(systemData.currentBody.angle) >= 0) {
			y = 1;
		}
		else {
			y = -1; 
		}
		if (x == 1 && y == 1) {
			quadrant = 1;
		}
		else if (x == -1 && y == 1) {
			quadrant = 2;
		}
		else if (x == -1 && y == -1) {
			quadrant = 3;
		}
		else {
			quadrant = 4;
		}
		return quadrant
	}

	public endUpdate(dt: number) {
		const systemData = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
		if (systemData.doClick) 
			this.startClick();

		// RENDER DEBUG LINES //
		if (systemData.doDebugRendering && Input.isMouseButtonPressed(0) && systemData.nullBody && systemData.currentBody) {
			console.log(this.checkQuadrant());
			const quadrant = this.checkQuadrant();
			/////////////////////////////// TODO: JAKE - Task 2 ///////////////////////////////
			// Render the line at the correct coordinate.
			// Function Renderer.submitLine(x0, y0, x1, y1, color, zIndex);
			// Currently set to the center of the body: systemData.currentBody.position[0], systemData.currentBody.position[1],
			// Useful variables:
			// systemData.currentBody.position[0] --> x position of body.
			// systemData.currentBody.position[1] --> y position of body.
			// systemData.currentBody.angle --> angle in radians.
			// systemData.constraint.localAnchorB[0] --> x position of anchor within body (rotated axis).
			// systemData.constraint.localAnchorB[1] --> y position of anchor within body (rotated axis).
			Renderer.submitLine(systemData.nullBody.position[0], systemData.nullBody.position[1], 
				// Set x1 and y1 to the position of the point within the body
				systemData.currentBody.position[0], systemData.currentBody.position[1],
				/////////////////////////////// END TODO ///////////////////////////////
				vec4.fromValues(0.9, 0.9, 0.9, 0.9), 0);

			
		}
	}

	public getComponentTuples(): string[][] {
		return [['Polar:PhysicsBody']];
	}

	public getName(): string {
		return 'Polar:PhysicsDebugInteractionSystem';
	}

	private startClick() {
		(<PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction')).doClick = false;

		const systemData = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
		const world = (<PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld')).world;
		systemData.constraint = null;
		systemData.currentBody = null;
		
		const position = Renderer.screenToWorldPosition(Input.getMousePosition());
		systemData.nullBody.position = [position[0], position[1]];

		for (const body of world.bodies) {
			if (body.aabb.containsPoint(systemData.nullBody.position) && body.mass < 1e308) {
				systemData.currentBody = body;
				break;
			}
		}
		if (systemData.currentBody) {
			systemData.constraint = new p2.RevoluteConstraint(systemData.nullBody, systemData.currentBody, { worldPivot: [position[0], position[1]], collideConnected: false });
			systemData.constraint.setRelaxation(10);
			systemData.constraint.setStiffness(50 * systemData.currentBody.mass);

			let x = 0;
			let y = 0;
			if (position[1]-systemData.currentBody.position[1] > 0) {
				x = Math.sqrt(Math.pow((position[0]-systemData.currentBody.position[0]), 2)+Math.pow((position[1]-systemData.currentBody.position[1]), 2))*Math.cos((Math.PI/2)-systemData.currentBody.angle-Math.atan((position[0]-systemData.currentBody.position[0])/(position[1]-systemData.currentBody.position[1])));
				y = Math.sqrt(Math.pow((position[0]-systemData.currentBody.position[0]), 2)+Math.pow((position[1]-systemData.currentBody.position[1]), 2))*Math.sin((Math.PI/2)-systemData.currentBody.angle-Math.atan((position[0]-systemData.currentBody.position[0])/(position[1]-systemData.currentBody.position[1])));
			}
			else {
				x = Math.sqrt(Math.pow((position[0]-systemData.currentBody.position[0]), 2)+Math.pow((position[1]-systemData.currentBody.position[1]), 2))*Math.cos((Math.PI/2)-systemData.currentBody.angle-Math.atan((position[0]-systemData.currentBody.position[0])/(position[1]-systemData.currentBody.position[1])) + Math.PI);
				y = Math.sqrt(Math.pow((position[0]-systemData.currentBody.position[0]), 2)+Math.pow((position[1]-systemData.currentBody.position[1]), 2))*Math.sin((Math.PI/2)-systemData.currentBody.angle-Math.atan((position[0]-systemData.currentBody.position[0])/(position[1]-systemData.currentBody.position[1])) + Math.PI);
			}
			//Set the local anchor of body B ( list with x and y )
			//systemData.constraint.localAnchorB = [x, y];

			world.addConstraint(systemData.constraint);
		}
	}

	private updatePosition() {
		if (Input.isMouseButtonPressed(0)) {
			const position = Renderer.screenToWorldPosition(Input.getMousePosition());
			const info = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
			info.nullBody.position = [position[0], position[1]];
		}
	}
}

export class PhysicsDebugInteractionCP extends Component {

	public currentBody: p2.Body;
	public nullBody: p2.Body;
	public constraint: p2.RevoluteConstraint;
	public doClick: boolean;
	public doDebugRendering: boolean;

	/**
	 * Create a new Physics Debug Interaction Component.
	 * @param {boolean} doDebugRender Whether the system will do debug rendering.
	 */
	public constructor(doDebugRendering: boolean = false) {
		super();
		this.doDebugRendering = doDebugRendering;
	}

	getType(): string {
		return 'Polar:PhysicsDebugInteraction';
	}
}
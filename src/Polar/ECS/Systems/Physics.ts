import * as glm from 'gl-matrix';
import * as p2 from 'p2';
import { System, Component, Entity } from 'Polar/ECS/ECS';
import { Renderer } from 'Polar/Renderer/Renderer';
import { createTransform } from 'Polar/Util/Math';
import { Input } from 'Polar/Core/Input';

/** A system which manages a p2 physics world.
 * @extends System
 */
export class PhysicsSystem extends System {

	public onAttach() {}

	public onDetach() {}

	public beginUpdate(dt: number) {
		const systemData = <PhysicsWorldCP>this.manager.getSingleton('Polar:PhysicsWorld');
		if (dt < 0.2) 
			systemData.world.step(dt, null, 3);
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {}

	public endUpdate(dt: number) {}

	public getComponentTuples(): string[][] { return []; }

	public getName(): string { return 'Polar:PhysicsSystem'; }
}

/** A component which stores information about an entity's physics body.
 * @extends Component
 */
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

/** A singleton component which represents a p2 physics world.
 * @extends Component
 */
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

/** A system which renders debug outlines of physics bodies within the world. 
 * @extends System
 */
export class PhysicsDebugRenderSystem extends System {
	public onAttach(): void {}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {
		const body = (<PhysicsBodyCP>entity.getComponent('Polar:PhysicsBody')).body;
		// Render shapes...
		for (const shape of body.shapes) {
			if (shape.type == p2.Shape.BOX || shape.type == p2.Shape.CONVEX) {
				const box = <p2.Box>shape;
				Renderer.submitColoredOutline(glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 
					createTransform(body.position[0] + box.position[0], body.position[1] + box.position[1], 
						box.width, box.height, (body.angle + box.angle) * 180 / Math.PI, 0));
				Renderer.submitLine(body.position[0] + box.position[0], body.position[1] + box.position[1],
					body.position[0] + box.position[0] + box.width / 2 * Math.cos(body.angle + box.angle), 
					body.position[1] + box.position[1] + box.width / 2 * Math.sin(body.angle + box.angle), 
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
			}
			else if (shape.type == p2.Shape.CIRCLE) {
				const circle = <p2.Circle>shape;
				Renderer.submitCircle(body.position[0] + circle.position[0], body.position[1] + circle.position[1], circle.radius, glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0));
				Renderer.submitLine(body.position[0] + circle.position[0], body.position[1] + circle.position[1], 
					body.position[0] + circle.position[0] + circle.radius * Math.cos(body.angle + circle.angle), 
					body.position[1] + circle.position[1] + circle.radius * Math.sin(body.angle + circle.angle),
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
			}
			else if (shape.type == p2.Shape.LINE) {
				const line = <p2.Line>shape;
				Renderer.submitLine(line.position[0], line.position[1], 
					line.position[0] + line.length * Math.cos(body.angle + line.angle), 
					line.position[1] + line.length * Math.sin(body.angle + line.angle), 
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 9);
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

/** A system which allows the user to click and drag physics bodies around the world.
 * @extends System
 */
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

	private checkQuadrant() {
		const systemData = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
		let quadrant: number;
		if ((systemData.nullBody.position[0]-systemData.currentBody.position[0])*Math.cos(systemData.currentBody.angle)+(systemData.nullBody.position[1]-systemData.currentBody.position[1])*Math.sin(systemData.currentBody.angle) >= 0) {
			if ((systemData.nullBody.position[1]-systemData.currentBody.position[1])*Math.cos(systemData.currentBody.angle)-(systemData.nullBody.position[0]-systemData.currentBody.position[0])*Math.sin(systemData.currentBody.angle) >= 0) {
				quadrant = 1;
			}
			else {
				quadrant = 4;
			}
		}
		else {
			if ((systemData.nullBody.position[1]-systemData.currentBody.position[1])*Math.cos(systemData.currentBody.angle)-(systemData.nullBody.position[0]-systemData.currentBody.position[0])*Math.sin(systemData.currentBody.angle) >= 0) {
				quadrant = 2;
			}
			else {
				quadrant = 3;
			}
		} 
		return quadrant;
	}

	private calculateAngle(systemData: PhysicsDebugInteractionCP) {
		const quadrant = this.checkQuadrant();
		let angle: number;
		// check if mouse is up or down and left or right of the centre of the box at time of click
		// calculate angle of the click point relative to rotation of box
		if (systemData.nullBody.position[0] >= systemData.currentBody.position[0]) {
			if (systemData.nullBody.position[1] >= systemData.currentBody.position[1]) {
				if (quadrant == 1) {
					angle = Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else if (quadrant == 2) {
					angle = -systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
				else if (quadrant == 3) {
					angle = Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else {
					angle = -systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
			}
			else {
				if (quadrant == 1) {
					angle = -Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else if (quadrant == 2) {
					angle = -systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
				else if (quadrant == 3) {
					angle = 3*Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else {
					angle = -systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
			}
		}
		else {
			if (systemData.nullBody.position[1] >= systemData.currentBody.position[1]) {
				if (quadrant == 1) {
					angle = Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else if (quadrant == 2) {
					angle = Math.PI-systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
				else if (quadrant == 3) {
					angle = Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else {
					angle = Math.PI-systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
			}
			else {
				if (quadrant == 1) {
					angle = -Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else if (quadrant == 2) {
					angle = Math.PI-systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
				else if (quadrant == 3) {
					angle = 3*Math.PI/2-systemData.currentBody.angle-Math.atan((systemData.nullBody.position[0]-systemData.currentBody.position[0])/(systemData.nullBody.position[1]-systemData.currentBody.position[1]));
				}
				else {
					angle = Math.PI-systemData.currentBody.angle+Math.atan((systemData.nullBody.position[1]-systemData.currentBody.position[1])/(systemData.nullBody.position[0]-systemData.currentBody.position[0]));
				}
			}
		}
		return angle;
	}

	public endUpdate(dt: number) {
		const systemData = <PhysicsDebugInteractionCP>this.manager.getSingleton('Polar:PhysicsDebugInteraction');
		if (systemData.doClick) 
			this.startClick();

		// RENDER DEBUG LINES //
		if (systemData.doDebugRendering && Input.isMouseButtonPressed(0) && systemData.nullBody && systemData.currentBody) {
			
			
			Renderer.submitLine(systemData.nullBody.position[0], systemData.nullBody.position[1], systemData.currentBody.position[0]+systemData.lineMagnitude*Math.cos(systemData.lineAngle+systemData.currentBody.angle), systemData.currentBody.position[1]+systemData.lineMagnitude*Math.sin(systemData.lineAngle+systemData.currentBody.angle), glm.vec4.fromValues(0.9, 0.9, 0.9, 0.9), 0);
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

			systemData.lineAngle = this.calculateAngle(systemData);
			systemData.lineMagnitude = Math.sqrt(Math.pow(systemData.nullBody.position[0]-systemData.currentBody.position[0], 2)+Math.pow(systemData.nullBody.position[1]-systemData.currentBody.position[1], 2));
			
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

/** A singleton component which stores information for a PhysicsDebugInteractionSystem 
 * @extends Component
*/
export class PhysicsDebugInteractionCP extends Component {

	public currentBody: p2.Body;
	public nullBody: p2.Body;
	public constraint: p2.RevoluteConstraint;
	public doClick: boolean;
	public doDebugRendering: boolean;
	public lineAngle: number;
	public lineMagnitude: number;

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
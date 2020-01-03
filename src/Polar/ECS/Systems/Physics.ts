import * as glm from 'gl-matrix';
import * as p2 from 'p2';
import { System } from '../System';
import { Component } from '../Component';
import { Entity } from '../Entity';
import { Renderer } from '../../Renderer/Renderer';
import { createTransform } from '../../Util/Math';
import { Input } from '../../Core/Input';
import { Event, EventDispatcher } from '../../Events/Event';
import { MouseDownEvent, MouseUpEvent, MouseMoveEvent } from '../../Events/MouseEvent';
import { CameraTransformEvent } from './CameraControllerSystem';

/** A component which stores information about an entity's physics body. */
export class PhysicsBodyCP extends Component {
	
	public readonly type = 'Polar:PhysicsBody';

	/** The p2 body. */
	public body: p2.Body;

	/**
	 * Create a p2 body component.
	 * @param {p2.Body} body The p2 body.
	 */
	public constructor(body: p2.Body) {
		super();
		this.body = body;
	}
}

/** A singleton component which represents a p2 physics world. */
export class PhysicsWorldCP extends Component {
	
	public readonly type = 'Polar:PhysicsWorld';

	public world: p2.World;

	/**
	 * Create a new physics world singleton component
	 * @param {p2.WorldOptions} [settings] The world settings.
	 */
	public constructor(settings?: p2.WorldOptions) {
		super();
		this.world = new p2.World(settings);
	}
}

/** 
 * A component which is required to attach a single texture to a p2 physics body. 
 * 
 * @component 'Polar:BodyTextureAttachment'
*/
export class BodyTextureAttachmentCP {

	public readonly type = 'Polar:BodyTextureAttachment';

	/** How much the texture is translated in the x-axis compared to the body, in world units.*/
	public offsetX: number;
	/** How much the texture is translated in the y-axis compared to the body, in world units.*/
	public offsetY: number;
	/** The width of the texture in world units.*/
	public width: number;
	/** The height of the texture in world units.*/
	public height: number;
	/** How much the texture is rotated relative to the body in radians.*/
	public rotation: number;

	/**
	 * Create a new body texture attachment component.
	 * @param {number} offsetX How much the texture is translated in the x-axis compared to the body, in world units.
	 * @param {number} offsetY How much the texture is translated in the y-axis compared to the body, in world units.
	 * @param {number} width The width of the texture in world units.
	 * @param {number} height The height of the texture in world units.
	 * @param {number} rotation How much the texture is rotated relative to the body in radians.
	 */
	public constructor(offsetX: number = 0, offsetY: number = 0, width: number = 1, height: number = 1, rotation: number = 0) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.width = width;
		this.height = height;
		this.rotation = rotation;
	}
}

/** A system which manages a p2 physics world. */
export class PhysicsSystem extends System {
	
	public onAttach() {}

	public onDetach() {}
	
	public beginUpdate(dt: number) {
		const systemData = <PhysicsWorldCP>this.getManager().getSingleton('Polar:PhysicsWorld');
		if (dt < 0.2) 
			systemData.world.step(dt, null, 3);
	}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {}
	
	public endUpdate(dt: number) {}

	public onEvent(event: Event): void {}
	
	public getComponentTuples(): string[][] { return []; }

	public getName(): string { return 'Polar:PhysicsSystem'; }
}

/** A system which renders debug outlines of physics bodies within the world. */
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
						body.angle + box.angle, box.width, box.height, 0));
				
				Renderer.submitLine(body.position[0] + box.position[0], body.position[1] + box.position[1],
					body.position[0] + box.position[0] + box.width / 2 * Math.cos(body.angle + box.angle), 
					body.position[1] + box.position[1] + box.width / 2 * Math.sin(body.angle + box.angle), 
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 0.2);
			}
			else if (shape.type == p2.Shape.CIRCLE) {
				const circle = <p2.Circle>shape;
				Renderer.submitCircle(body.position[0] + circle.position[0], body.position[1] + circle.position[1], circle.radius, glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0));
				Renderer.submitLine(body.position[0] + circle.position[0], body.position[1] + circle.position[1], 
					body.position[0] + circle.position[0] + circle.radius * Math.cos(body.angle + circle.angle), 
					body.position[1] + circle.position[1] + circle.radius * Math.sin(body.angle + circle.angle),
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 0.2);
			}
			else if (shape.type == p2.Shape.LINE) {
				const line = <p2.Line>shape;
				Renderer.submitLine(line.position[0], line.position[1], 
					line.position[0] + line.length * Math.cos(body.angle + line.angle), 
					line.position[1] + line.length * Math.sin(body.angle + line.angle), 
					glm.vec4.fromValues(0.9, 0.1, 0.9, 1.0), 0.2);
			}
		}
	}
				
	public beginUpdate(dt: number) {}
	
	public endUpdate(dt: number) {}

	public onEvent(event: Event): void {}
	
	public getComponentTuples(): string[][] {
		return [['Polar:PhysicsBody']];
	}
			
	public getName(): string {
		return 'Polar:PhysicsDebugRendererSystem';
	}
}
	
/** A system which allows the user to click and drag physics bodies around the world. */
export class PhysicsDebugInteractionSystem extends System {
	
	public onAttach(): void {
		(<PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction')).nullBody = new p2.Body({mass: 0});
		(<PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction')).nullBody.collisionResponse = false;
		(<PhysicsWorldCP>this.getManager().getSingleton('Polar:PhysicsWorld')).world.islandSplit = false;
	}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number) {}
	
	public beginUpdate(dt: number) {}

	private checkQuadrant() {
		const systemData = <PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction');
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
		const systemData = <PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction');
		if (systemData.doClick) 
			this.startClick();

		// RENDER DEBUG LINES //
		if (systemData.doDebugRendering && Input.isMouseButtonPressed(0) && systemData.nullBody && systemData.currentBody) {
			Renderer.submitLine(systemData.nullBody.position[0], 
				systemData.nullBody.position[1], 
				systemData.currentBody.position[0]+systemData.lineMagnitude*Math.cos(systemData.lineAngle+systemData.currentBody.angle), 
				systemData.currentBody.position[1]+systemData.lineMagnitude*Math.sin(systemData.lineAngle+systemData.currentBody.angle), 
				glm.vec4.fromValues(0.9, 0.9, 0.9, 0.9), 0.2);
		}
	}

	public onEvent(event: Event): void {
		const dispatcher = new EventDispatcher(event);
		// onMouseDown
		dispatcher.dispatch(MouseDownEvent, mouseEvent => {
			if (mouseEvent.button === 0) {
				(<PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction')).doClick = true;
			}
			return false;
		});

		// onMouseUp
		dispatcher.dispatch(MouseUpEvent, mouseEvent => {
			if (mouseEvent.button === 0) {
				const info = <PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction');
				const world = (<PhysicsWorldCP>this.getManager().getSingleton('Polar:PhysicsWorld')).world;
				world.removeConstraint(info.constraint);
				info.constraint = null;
				info.currentBody = null;
			}
			return false;
		});

		// onMouseMove
		dispatcher.dispatch(MouseMoveEvent, _ => {
			this.updatePosition();
			return false;
		});

		// onCameraTransform
		dispatcher.dispatch(CameraTransformEvent, _ => {
			this.updatePosition();
			return false;
		});
	}
	
	public getComponentTuples(): string[][] {
		return [['Polar:PhysicsBody']];
	}
	
	public getName(): string {
		return 'Polar:PhysicsDebugInteractionSystem';
	}
	
	private startClick() {
		(<PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction')).doClick = false;

		const systemData = <PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction');
		const world = (<PhysicsWorldCP>this.getManager().getSingleton('Polar:PhysicsWorld')).world;
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
			const info = <PhysicsDebugInteractionCP>this.getManager().getSingleton('Polar:PhysicsDebugInteraction');
			info.nullBody.position = [position[0], position[1]];
		}
	}
}

/** A singleton component which stores information for a PhysicsDebugInteractionSystem class. */
export class PhysicsDebugInteractionCP extends Component {

	public readonly type = 'Polar:PhysicsDebugInteraction';
	
	/** The current selected body. */
	public currentBody: p2.Body;
	/** The empty body which the mouse constraint is attached to. */
	public nullBody: p2.Body;
	/** The constraint which pulls the selected object towards the mouse. */
	public constraint: p2.RevoluteConstraint;
	/** Whether a click has been started.  */
	public doClick: boolean;
	/** Whether the system will render a line representing the constraint. */
	public doDebugRendering: boolean;
	/** The line's current angle. */
	public lineAngle: number;
	/** The line's current magnitude. */
	public lineMagnitude: number;

	/**
	 * Create a new Physics Debug Interaction Component.
	 * @param {boolean} doDebugRender Whether the system will do debug rendering.
	 */
	public constructor(doDebugRendering: boolean = false) {
		super();
		this.doDebugRendering = doDebugRendering;
	}
}
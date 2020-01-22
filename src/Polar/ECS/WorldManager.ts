import { System } from './System';
import { Entity } from './Entity';
import { Component } from './Component';
import { ECSState, ECSLoader, EntityTemplate } from './ECSState';
import { Event, EventHandler, EventCreator } from '../Events/Event';

/** Controls and manages the entity component system of a world. */
export class WorldManager implements EventHandler, EventCreator {
	private systems: System[];
	
	private entities: Map<number, Entity>;
	private entityCount: number;
	
	private singletons: Entity;
	
	eventCallbackFn: (event: Event) => void;
	
	/** Create a new world manager. */
	public constructor(eventCallbackFn: (event: Event) => void, state?: ECSState) {
		
		if (!eventCallbackFn)
			console.error('No event callback function specified. If this is being called from a layer, input this.eventCallbackFn.');
		this.eventCallbackFn = eventCallbackFn;

		this.entityCount = 0;
		this.entities = new Map<number, Entity>();
		this.systems = [];
		if(state) {
			// Load singletons.
			this.singletons = new Entity(-1);
			for (let component of state.singletons.components) {
				this.singletons.addComponent(component);
			}
			
			// Load systems.
			for (let system of ECSLoader.getSystems(state)) {
				this.addSystem(system);
			}
			
			// Load entities.
			for (let template of state.entities) {
				let entity = this.createEntity();
				for (let component of template.components) {
					entity.addComponent(component);
				}
				this.registerComponents(entity);
			}
		}
		else {
			this.singletons = new Entity(-1);
		}
	}

	/**
	 * To be called every frame.
	 * @param {number} dt The time elapsed since the last frame in seconds.
	 */
	public onUpdate(dt: number) {
		for (const system of this.systems) {
			system.beginUpdate(dt);
		}
		for (const system of this.systems) {
			for (const [eid, subIndex] of system.subscribers) {
				system.onEntityUpdate(dt, this.entities.get(eid), subIndex);
			}
		}
		for (const system of this.systems) {
			system.endUpdate(dt);
		}
	}

	/**
	 * Propagates an event to all the world manager systems. To be called in Layer.onEvent(...).
	 * @param {Event} event The event.
	 */
	public onEvent(event: Event) {
		for (const system of this.systems) {
			system.onEvent(event);
		}
	}
	
	/**
	 * Add a system to the world.
	 * @param {System} system The system to be added.
	 */
	public addSystem(system: System) {
		system.getManager = () => { return this; };
		system.eventCallbackFn = this.eventCallbackFn;
		this.systems.push(system);
		system.onAttach();
	}

	/**
	 * Remove a system through its name.
	 * @param {string} name The name of the system, the overridden return value of System.getName().
	 */
	public removeSystemByName(name: string) {
		for (let i = this.systems.length - 1; i >= 0; i--) {
			if (this.systems[i].getName() == name) {
				this.systems[i].onDetach();
				this.systems.splice(i, 1);
			}
		}
	}

	/**
	 * Get an entity from the manager using its ID.
	 * @param {number} id The ID of the entity.
	 * @returns {Entity} The entity.
	 */
	public getEntityById(id: number): Entity {
		return this.entities.get(id);
	}
	
	/**
	 * Add an empty entity to the world.
	 * @returns {Entity} The entity which was added.
	 */
	public createEntity(): Entity {
		let eid = this.entityCount++;
		let entity = new Entity(eid);
		this.entities.set(eid, entity);
		return entity;
	}

	/**
	 * Removes an entity by its ID.
	 * @param {number} eid The entity's ID.
	 * @returns {boolean} Whether the entity existed and was removed.
	 */
	public removeEntityById(eid: number): boolean {
		this.removeEntitySubscriptions(eid);
		return this.entities.delete(eid);
	}

	/**
	 * Recalculates the systems which are subscribed to this entity.
	 * @param {Entity} entity The entity to be subscribed to the appropriate systems.
	 */
	public registerComponents(entity: Entity) {
		for (const system of this.systems) {
			// If the system already has the entity subscribed, continue.
			if (system.subscribers.has(entity.id)) {
				console.log(`eid ${entity.id} is already a subscriber of system ${system.getName()}`);
				continue;
			}
			
			// Check if the entity is subscribed to this system.
			let systemAdded = false;
			const tuples = system.getComponentTuples();
			for (let i = 0; i < tuples.length; i++) {
				if( tuples[i].every(val => Array.from(entity.components.keys()).includes(val))) {
					if (!system.subscribers.has(entity.id)) {
						system.subscribers.set(entity.id, i);
					}
				}
				
				if (systemAdded)
					break;
			}
		}
	}

	/**
	 * Removes the entity from all system subscriptions.
	 * Stops the entity from being updated.
	 * @param {number} eid The entity's ID.
	 */
	public removeEntitySubscriptions(eid: number) {
		// Remove the system subscribers.
		for (const system of this.systems) {
			system.subscribers.delete(eid);
		}
	}

	/**
	 * Recalculates all entity subscribers.
	 * High performance cost - use sparingly.
	 * To be used if a new system is added after the entities, or for debug.
	 */
	public recalculateAllSubscribers() {
		// Clear all current subscribers.
		for (const system of this.systems)
			system.subscribers.clear();
		
		// Add all current entity subscriptions.
		for (const entity of this.entities.values())
			this.registerComponents(entity);
	}

	/**
	 * Get a singleton component from the manager.
	 * @param {string} componentId The component's id, eg 'Polar:CameraController'.
	 * @returns {Component} The singleton component.
	 */
	public getSingleton(componentId: string): Component {
		return this.singletons.getComponent(componentId);
	}

	/**
	 * Add a singleton component to the ECS manager.
	 * @param {Component} component The component to add.
	 */
	public addSingleton(component: Component) {
		this.singletons.addComponent(component);
	}

	public exportState(): ECSState {
		let systemNames: string[] = [];
		for (let system of this.systems.values()) {
			systemNames.push(system.getName());
		}

		let entityTemplates: EntityTemplate[] = [];
		for (let entity of this.entities.values()) {
			entityTemplates.push(new EntityTemplate(entity.id, Array.from(entity.components.values())));
		}

		let singletons = new EntityTemplate(this.singletons.id, Array.from(this.singletons.components.values()));

		return new ECSState(systemNames, entityTemplates, singletons);
	}
}
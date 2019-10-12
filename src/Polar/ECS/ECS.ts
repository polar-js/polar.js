
/** Represents a collection of components relating to a single entity in the world. */
export class Entity {
	public readonly id: number;
	
	public readonly components: Map<string, Component>;

	//public subscribers: number[] = [];

	public constructor(id: number) {
		this.id = id;
		this.components = new Map<string, Component>();
	}

	public hasComponent(type: string): boolean {
		return this.components.has(type);
	}

	public getComponent(type: string): Component {
		return this.components.get(type);
	}

	public addComponent(c: Component) {
		this.components.set(c.getType(), c);
	}

	public removeComponent(type: string) {
		this.components.delete(type);
	}
}

/**
 * Represents a collection of information about an entity used to define behavior.
 * Should contain no behavior / functionality, only data.
 * @abstract
 */
export abstract class Component {
	/**
	 * Get the type of the component.
	 * To be overridden in every component subclass to return a string unique to the component type.
	 * Recommended format: '<Namespace>:<ComponentClassName>'.
	 * Example: 'Sandbox:Goal'.
	 * @returns {string} A unique identifier for the component type.
	 */
	public abstract getType(): string;
}

/**
 * Represents a behavior which is applied to entities' components.
 * Should contain no state / data.
 * @abstract
 */
export abstract class System {
	public manager: WorldManager;
	public subscribers: Map<number, number>;

	public constructor() {
		this.subscribers = new Map<number, number>();
	}

	/** Called after the system is added to the world manager. */
	public abstract onAttach(): void;

	/** Called before the system is removed from the world manager. */
	public onDetach(): void { this.manager = null; };

	/**
	 * Called every update for each entity subscribed to system.
	 * @param {number} dt The elapsed time since the last frame in seconds.
	 * @param {Array<Entity>} entity The entity to be updated.
	 * @param {number} subIndex The index of the tuple which the entity subscribed to in System.getComponentTuples();
	 */
	public abstract onEntityUpdate(dt: number, entity: Entity, subIndex: number): void;

	/**
	 * Called by the world manager at the start of an update cycle.
	 * @param dt Time elapsed since last update in seconds.
	 * @abstract
	 */
	public abstract beginUpdate(dt: number): void;

	/**
	 * Called by the world manager at the end of an update cycle.
	 * @param dt Time elapsed since last update in seconds.
	 * @abstract
	 */
	public abstract endUpdate(dt: number): void;

	/**
	 * Returns the component tuples for a system.
	 * @returns {string[][]} An array of tuples which contain the types of components which are to be updated.
	 * @abstract
	 */
	public abstract getComponentTuples(): string[][];

	/**
	 * Returns the name of the system, unique to each system type.
	 * Recommended format: '<Namespace>:<SystemClassName>'.
	 * Example: 'Sandbox:GoalSystem'.
	 * @returns {string} The name of the system.
	 * @abstract
	 */
	public abstract getName(): string;

	/**
	 * Called every update.
	 * @param {number} dt The elapsed time since the last frame in seconds.
	 * @param {Array<Entity>} entities The entities which are subscribed to the system.
	 * @abstract
	 * @deprecated
	 */
}

/** Controls and manages the entity component system of a world. */
export abstract class WorldManager {
	private systems: Array<System>;

	private entities: Map<number, Entity>;
	private entityTrack: number = 0;

	private singletons: Entity;

	public constructor() {
		this.systems = new Array<System>();
		this.entities = new Map<number, Entity>();
		this.singletons = new Entity(-1);
	}

	/**
	 * To be called every frame.
	 * @param {number} dt The time elapsed since the last frame in seconds.
	 */
	public onUpdate(dt: number) {
		for (const system of this.systems) {
			system.beginUpdate(dt);
			for (const [eid, subIndex] of system.subscribers) {
				system.onEntityUpdate(dt, this.entities.get(eid), subIndex);
			}
			system.endUpdate(dt);
		}
	}

	/**
	 * Add a system to the world.
	 * @param {System} system The system to be added.
	 */
	public addSystem(system: System) {
		system.manager = this;
		this.systems.push(system);
		system.onAttach();
	}

	/**
	 * Remove a system through its name.
	 * @param name The name of the system, the overridden return value of System.getName().
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
	public addEntity(): Entity {
		let eid = this.entityTrack++;
		let entity = new Entity(eid);
		this.entities.set(eid, entity);
		this.addEntitySubscriptions(eid);
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
	 * @param {number} eid The entity to be subscribed to the appropriate systems.
	 */
	public addEntitySubscriptions(eid: number) {
		const entity = this.entities.get(eid);

		for (const system of this.systems) {
			// If the system already has the entity subscribed, continue.
			if (system.subscribers.has(eid)) {
				continue;
			}
			
			// Check if the entity is subscribed to this system.
			let systemAdded = false;
			for (const tuples of system.getComponentTuples()) {
				//for (const tuple of tuples) {
				for (let i = 0; i < tuples.length; i++) {
					// Check if the tuple array is a subset of the components array.
					if( Array.from(entity.components.keys()).every(val => tuples[i].includes(val)) ) {
						if (!system.subscribers.has(eid)) {
							system.subscribers.set(eid, i);
						}
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
	 * To be used after a new system is added after the entities.
	 */
	public recalculateAllSubscribers() {
		// Clear all current subscribers.
		for (const system of this.systems)
			system.subscribers.clear();
		
		// Add all current entity subscriptions.
		for (const eid of this.entities.keys())
			this.addEntitySubscriptions(eid);
	}

	public getSingleton(componentId: string): Component {
		return this.singletons.getComponent(componentId);
	}

	public addSingleton(component: Component) {
		this.singletons.addComponent(component);
	}
}
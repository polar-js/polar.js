import Texture2D from "Polar/Renderer/Texture";

/** Represents a collection of components relating to a single entity in the world. */
export class Entity {
	public readonly id: number;
	
	public readonly components: Map<string, Component>;

	public subscribers: number[] = [];

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
 * Represents a collection of information about an entity used to define behaviour.
 * Should contain no behaviour / functionality, only data.
 * @abstract
 */
export abstract class Component {
	/**
	 * Get the type of the component.
	 * To be overridden in every component subclass to return a string unique to the component type.
	 * @returns {string} A unique identifier for the component type.
	 */
	public abstract getType(): string;
}

/**
 * Represents a behaviour which is applied to entities' components.
 * Should contain no state / data.
 * @abstract
 */
export abstract class System {
	/**
	 * Returns the component tuples for a system.
	 * @returns {string[][]} An array of tuples which contain the types of components which are to be updated.
	 * @abstract
	 */
	public abstract getComponentTuples(): string[][];

	/**
	 * Returns the name of the system, unique to each system type.
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
	//public abstract onUpdate(dt: number, entities: Array<Entity>): void;

	/**
	 * Called every update for each entity subscribed to system.
	 * @param {number} dt The elapsed time since the last frame in seconds.
	 * @param {Array<Entity>} entity The entity to be updated.
	 */
	public abstract onEntityUpdate(dt: number, entity: Entity): void;
}

export abstract class WorldManager {
	private systems: Map<number, System>;
	private systemTrack: number = 0;

	private entities: Map<number, Entity>;
	private entityTrack: number = 0;

	public constructor() {
		this.systems = new Map<number, System>();
		this.entities = new Map<number, Entity>();
	}

	/**
	 * To be called every frame.
	 * @param {number} dt The time elapsed since the last frame in seconds.
	 */
	public onUpdate(dt: number) {
		for (const entity of this.entities.values()) {
			for (const sub of entity.subscribers)
				this.systems.get(sub).onEntityUpdate(dt, entity);
		}
	}

	/**
	 * Add a system to the world.
	 * @param {System} system The system object to be added.
	 */
	public addSystem(system: System) {
		this.systems.set(this.systemTrack++, system);
	}

	/**
	 * Remove a system through its name.
	 * @param name The name of the system, the overridden return value of System.getName().
	 */
	public removeSystemByName(name: string) {
		for (let [key, system] of this.systems) {
			if (system.getName() == name) {
				this.systems.delete(key);
			}
		}
	}

	/**
	 * Get an entity from the manager using its ID.
	 * @param id The ID of the entity.
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
		return entity;
	}

	/**
	 * Removes an entity by its ID.
	 * @param {number} eid The entity's ID.
	 * @returns {boolean} Whether the entity existed and was removed.
	 */
	public removeEntityById(eid: number): boolean {
		return this.entities.delete(eid);
	}

	/**
	 * Recalculates the systems which are subscribed to this entity.
	 * @param {Map<number, System>} systems The system list.
	 */
	public recalculateEntitySubscribers(eid: number) {
		const entity = this.entities.get(eid);
		entity.subscribers = [];
		for (const [skey, system] of this.systems) {
			let systemAdded = false;
			for (const tuples of system.getComponentTuples()) {
				for (const tuple of tuples) {
					// Check if the tuple array is a subset of the components array.
					if( Array.from(entity.components.keys()).every(val => tuple.includes(val)) ) {
						if (entity.subscribers.indexOf(skey) === -1) {
							entity.subscribers.push(skey);
							systemAdded = true;
							break;
						}
					}
				}
				if (systemAdded)
					break;
			}
		}
	}

	/**
	 * Recalculates all entity subscribers.
	 * High performance cost - use sparingly.
	 */
	public recalculateAllSubscribers() {
		for (const eid of this.entities.keys())
			this.recalculateEntitySubscribers(eid);
	}
}
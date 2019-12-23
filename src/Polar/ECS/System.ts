import { WorldManager } from './WorldManager';
import { Entity } from './Entity';

/**
 * Represents a behavior which is applied to entities' components.
 * Should contain no state / data.
 * @abstract
 */
export abstract class System {
	/** The system's subscribed entities. Format: [Entity ID: string, Subscriber Index: string] */
	public subscribers: Map<number, number>;

	/** Create a new system. */
	public constructor() {
		this.subscribers = new Map<number, number>();
	}

	/** Called after the system is added to the world manager. */
	public abstract onAttach(): void;

	/** Called before the system is removed from the world manager. */
	public onDetach(): void { /*this.manager = null;*/ };

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
	 * @param {number} dt Time elapsed since last update in seconds.
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
	 * @remarks
	 * Recommended format: '<Namespace>:<SystemClassName>'.
	 * @example 'Sandbox:GoalSystem'.
	 * @returns {string} The name of the system.
	 * @abstract
	 */
	public abstract getName(): string;

	public getManager: () => WorldManager;
}
import { Component } from './Component';

/** Represents a collection of components relating to a single entity in the world. */
export class Entity {
	/** The entity's ID.*/
	public id: number;
	
	/** The entity's components.*/
	public readonly components: Map<string, Component>;

	/** Create a new entity.
	 * @param {number} id The entity's ID.
	 */
	public constructor(id: number) {
		this.id = id;
		this.components = new Map<string, Component>();
	}

	/**
	 * Test if an entity has a component.
	 * Note: Often it is better to use the 'subIndex' parameter within system.onEntityUpdate( ... ) { ... }.
	 * @param {string} type The component type.
	 * @returns {boolean} Whether the entity has the component.
	 */
	public hasComponent(type: string): boolean {
		return this.components.has(type);
	}

	/**
	 * Get a component from an entity.
	 * @param {string} type The component type.
	 * @returns {Component} The component.
	 */
	public getComponent(type: string): Component {
		return this.components.get(type);
	}

	/**
	 * Add a component to an entity.
	 * @param {Component} component The component to add.
	 */
	public addComponent(component: Component) {
		this.components.set(component.type, component);
	}

	/**
	 * Remove a component from an entity.
	 * @param {string} type The component type to remove.
	 */
	public removeComponent(type: string) {
		this.components.delete(type);
	}
}
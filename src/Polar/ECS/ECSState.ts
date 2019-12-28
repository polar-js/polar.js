import { Component } from './Component';
import { System } from './System';

export class ECSState {
	public systemNames: string[];
	public entities: EntityTemplate[];
	public singletons: EntityTemplate;

	public constructor(systemNames: string[], entities: EntityTemplate[], singletons: EntityTemplate) {
		this.systemNames = systemNames;
		this.entities = entities;
		this.singletons = singletons;
	}
}

export class ECSLoader {
	private static registeredSystems: Map<string, System>;
	public static getSystems(state: ECSState): System[] {
		let systems: System[] = [];
		for (let system of this.registeredSystems.values()) {
			if (state.systemNames.includes(system.getName())) {
				systems.push(system);
			}
		}
		return systems;
	}

	public static init() {
		this.registeredSystems = new Map<string, System>();
	}

	public static registerSystem(system: System) {
		if (this.registeredSystems) {
			this.registeredSystems.set(system.getName(), system);
		}
		else {
			console.error('this.registeredSystems is undefined. Remember to call Polar.ECSState.init().');
		}
	}
}

export class EntityTemplate {
	/** The entity's ID. */
	public id: number;
	/** The entity's components. */
	public components: Component[];

	/**
	 * Create a new EntityTemplate.
	 * @param {number} id The entity's ID.
	 * @param {Component[]} components The entity's components.
	 */
	constructor(id: number, components: Component[]) {
		this.id = id;
		this.components = components;
	}
}
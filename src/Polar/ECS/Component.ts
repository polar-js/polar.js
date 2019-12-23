/**
 * Represents a collection of information about an entity used to define behavior.
 * Should contain no behavior or functionality, only data in the form of properties.
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
	public readonly type: string = 'error';
}
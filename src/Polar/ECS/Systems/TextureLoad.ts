import { System } from '../System';
import { Component } from '../Component';
import { Entity } from '../Entity';
import { TextureLibrary } from '../../Renderer/TextureLibrary';

/** A system which loads and allows textures to be accessed using aliases within the entity component system. */
export class TextureLoadSystem extends System {
	public onAttach(): void {
		let component = <TextureLibraryCP>this.getManager().getSingleton('Polar:TextureLibrary');
		component.library = new TextureLibrary();
		component.library.loadManyFromPath(component.texturePaths);
	}

	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {}

	public beginUpdate(dt: number): void {}

	public endUpdate(dt: number): void {}

	public getComponentTuples(): string[][] {
		return [];
	}

	public getName(): string {
		return 'Polar:TextureLoadSystem';
	}
}

/** A singleton component used to store a number of textures for the TextureLoadSystem. */
export class TextureLibraryCP extends Component {

	public readonly type = 'Polar:TextureLibary';
	public library: TextureLibrary;
	/** An array of alias/path pairs to be loaded on TextureLoadSystem.onAttach(). */
	public texturePaths: [string, string][] = [];
}

export class TextureRefCP extends Component {
	public readonly type = 'Polar:TextureRef';
	/** The alias of the texture within the texture library. */
	public alias: string;
	/** The unscaled width of the rendered texture in world units. */
	public width: number;
	/** The unscaled height of the rendered texture in world units. */
	public height: number;

	/**
	 * Create a new texture reference component.
	 * @param {string} alias The alias of the texture within the texture library.
	 */
	public constructor(alias: string, width: number, height: number) {
		super();
		this.alias = alias;
		this.width = width;
		this.height = height;
	}
}
import { MaxRectsPacker, Rectangle } from 'maxrects-packer';
import * as glm from 'gl-matrix';
import { Texture2D } from './Texture';

/** Represents a single texture within a texture atlas. */
export class AtlasEntry extends Rectangle {
	public alias: string;
	public image: HTMLImageElement;

	public bounds: glm.vec4;

	constructor(alias: string) {
		super();
		this.alias = alias;
	}
}

/** A class which combines and indexes a number of images into a single image. */
export class TextureAtlas {
	
	private entries: Map<string, AtlasEntry>;
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private texture: Texture2D;

	/** Create a new texture atlas. */
	public constructor() {
		this.entries = new Map<string, AtlasEntry>();
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.texture = new Texture2D();
	}

	/** Set the images of the atlas and calculate.
	 * @param {[string, HTMLImageElement][]} images A list of image tuples with format: [alias: string, image: HTMLImageElement].
	 */
	public setImages(images: [string, HTMLImageElement][]) {
		
		const rawEntries: AtlasEntry[] = [];

		for (const [alias, image] of images) {
			if (!image.complete) {
				console.error(`Image '${alias}' not loaded.`);
			}

			const entry = new AtlasEntry(alias);
			rawEntries.push(entry);

			entry.image = image;
			entry.width = entry.image.width;
			entry.height = entry.image.height;
		}

		this.pack(rawEntries);

		const atlasImage = new Image();
		atlasImage.src = this.canvas.toDataURL();
		
		this.texture.loadFromImage(atlasImage);
	}

	/** 
	 * Pack the images
	 * @param {AtlasEntry[]} rawEntries
	 */
	private pack(rawEntries: AtlasEntry[]) {
		let packer = new MaxRectsPacker();
		packer.addArray(rawEntries);

		if (packer.bins.length > 1) console.error('Too many textures in atlas.');
		else if (packer.bins.length == 0) console.error('Not enough textures in atlas.');

		const bin = packer.bins[0];
		this.canvas.width = bin.width;
		this.canvas.height = bin.height;
		this.context.clearRect(0, 0, bin.width, bin.height);
		
		this.entries.clear();
		for (const rect of bin.rects) {
			const entry = rect as AtlasEntry;
			entry.bounds = glm.vec4.create();
			entry.bounds.set([entry.x / bin.width, entry.y + bin.height,
				entry.width / bin.width, entry.height / bin.height]);

			this.entries.set(entry.alias, entry);
			this.context.drawImage(entry.image, entry.x, entry.y);
		}
	}

	/**
	 * Get the atlas texture
	 * @returns {Texture2D}
	 */
	public getTexture(): Texture2D {
		return this.texture;
	}

	/**
	 * Get the bounds of a texture within the atlas.
	 * Format: x, y, width, height.
	 * @param {string} alias The image's alias.
	 * @returns {glm.vec4} The bounds. Format: x, y, width, height.
	 */
	public getBounds(alias: string): glm.vec4 {
		return this.entries.get(alias).bounds;
	}
}
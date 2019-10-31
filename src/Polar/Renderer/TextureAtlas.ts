import { MaxRectsPacker, Rectangle } from 'maxrects-packer';
import * as glm from 'gl-matrix';

export class AtlasEntry extends Rectangle {
	public path: string;
	public image: HTMLImageElement;
	public loaded: boolean = false;

	public uv: glm.vec4;

	constructor(path: string) {
		super();
		this.path = path;
	}
}

export class TextureAtlas {
	
	private entries: Map<string, AtlasEntry>;
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private image: HTMLImageElement;

	public constructor(paths: string[]) {
		this.entries = new Map<string, AtlasEntry>();
		this.image = new Image();
		const rawEntries: AtlasEntry[] = [];
		let numLoaded: number = 0;

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		for (const path of paths) {
			const entry = new AtlasEntry(path);
			rawEntries.push(entry);

			entry.image = new Image();
			entry.image.src = path;
			entry.image.addEventListener('load', () => {
				numLoaded++;
				console.log('loaded ' + entry.image.src);
				entry.loaded = true;
				entry.width = entry.image.width;
				entry.height = entry.image.height;

				if (numLoaded == paths.length) {
					this.pack(rawEntries);
				}
			});
		}
	}

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
			entry.uv = glm.vec4.create();
			entry.uv.set([entry.x / bin.maxWidth, (entry.x + entry.width) / bin.maxWidth,
				(entry.y + entry.height) / bin.maxHeight, entry.y / bin.maxHeight]);

			this.entries.set(entry.path, entry);
			this.context.drawImage(entry.image, entry.x, entry.y);
		}

		this.image.src = this.canvas.toDataURL();
	}

	public getImage(): HTMLImageElement {
		return this.image;
	}

	public getUV(path: string): glm.vec4 {
		return this.entries.get(path).uv;
	}
}
import { Texture2D } from 'Polar/Renderer/Texture';
import { MaxRectsPacker, Rectangle } from 'Polar/vendor/maxrects-packer/maxrects-packer';

export class AtlasEntry extends Rectangle {
	public path: string;
	public image: HTMLImageElement;
	public loaded: boolean = false;

	constructor(path: string) {
		super();
		this.path = path;
	}
}

export class TextureAtlas {
	
	private entries: Map<string, AtlasEntry>;
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	

	public constructor(paths: string[]) {
		this.entries = new Map<string, AtlasEntry>();

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		const rawEntries: AtlasEntry[] = [];
		let numLoaded: number = 0;

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

	public pack(rawEntries: AtlasEntry[]) {
		for (const raw of rawEntries) {
			console.log(`RAW - Path: '${raw.path}' x: ${raw.x} y: ${raw.y} width: ${raw.width} height: ${raw.height}`);
		}

		console.log('packing...');
		// Sort entries in descending order.
		let packer = new MaxRectsPacker();
		packer.addArray(rawEntries);

		if (packer.bins.length > 1) {
			console.error('Too many textures.');
		}
		else if (packer.bins.length == 0) {
			console.error('Not enough textures');
		}

		const bin = packer.bins[0];

		this.canvas.width = bin.width;
		this.canvas.height = bin.height;
		this.context.clearRect(0, 0, bin.width, bin.height);

		for (const rect of bin.rects) {
			const entry = rect as AtlasEntry;
			console.log(`BINNED - Path: '${entry.path}' x: ${entry.x} y: ${entry.y} width: ${entry.width} height: ${entry.height}`);
		}
	}
}
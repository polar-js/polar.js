export class ImageLibrary {
	private images: Map<string, HTMLImageElement>;

	public constructor() {
		this.images = new Map<string, HTMLImageElement>();
	}

	public loadPath(alias: string, path: string): HTMLImageElement {
		if (this.images.has(alias)) {
			console.warn(`Image alias '${alias}' already exists in library.`);
			return null;
		}
		
		const image = new Image();
		image.src = path;
		this.images.set(alias, image);
		return image;
	}

	public loadById(alias: string, id: string): HTMLImageElement {
		if (this.images.has(alias)) {
			console.warn(`Image alias '${alias}' already exists in library.`);
			return null;
		}
		
		const image = document.getElementById(id);
		if (image) {
			if (image.nodeName === 'IMAGE') {
				this.images.set(alias, <HTMLImageElement>image);
				return <HTMLImageElement>image;
			}
			else {
				console.error(`Element with id '${id}' is not an image.`);
			}
		}
		else {
			console.error(`Could not find element with id '${id}'`);
		}
		return null;
	}

	public get(alias: string): HTMLImageElement {
		return this.images.get(alias);
	}

	public has(alias: string): boolean {
		return this.images.has(alias);
	}
}
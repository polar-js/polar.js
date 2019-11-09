
/** Stores a number of images for your convenience. */
export class ImageLibrary {
	private images: Map<string, HTMLImageElement>;

	/** Create a new image library. */
	public constructor() {
		this.images = new Map<string, HTMLImageElement>();
	}

	/** Load an image into the library from a path.
	 * @param {string} alias The image's alias, used to access.
	 * @param {string} path The image's path.
	 * @returns {HTMLImageElement} The image.
	 */
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

	/** Load an image using its HTML element ID. 
	 * @param {string} alias The image's alias, used to access.
	 * @param {string} id The HTML element ID.
	 * @returns {HTMLImageElement} The image.
	*/
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

	/** Get an image from the library.
	 * @param {string} alias The image's alias.
	 * @returns {HTMLImageElement} The image.
	 */
	public get(alias: string): HTMLImageElement {
		return this.images.get(alias);
	}

	/** Check if an image is in the library.
	 * @param {string} alias The image's alias.
	 * @returns {boolean} Whether the image is in the library.
	 */
	public has(alias: string): boolean {
		return this.images.has(alias);
	}
}
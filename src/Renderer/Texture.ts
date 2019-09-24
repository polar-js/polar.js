import c from './Canvas';

export default class Texture2D {
    private path: string;
    private width: number;
    private height: number;
    private texture: WebGLTexture;

    private loaded: boolean;

    public constructor(path: string) {
        this.loaded = false;
        this.path = path;
        this.texture = c.gl.createTexture();
        c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
        // Fill texture with a 1x1 sample pixel.
        c.gl.texImage2D(c.gl.TEXTURE_2D, 0, c.gl.RGBA, 1, 1, 0, c.gl.RGBA, c.gl.UNSIGNED_BYTE, new Uint8Array([25, 25, 25, 255]));
        // Set texture parameters.
        c.gl.texParameteri(c.gl.TEXTURE_2D, c.gl.TEXTURE_MIN_FILTER, c.gl.LINEAR);
        c.gl.texParameteri(c.gl.TEXTURE_2D, c.gl.TEXTURE_MAG_FILTER, c.gl.NEAREST);

        const image = new Image();
        image.src = this.path;
        image.addEventListener('load', () => {
            c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
            c.gl.texImage2D(c.gl.TEXTURE_2D, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, image);
            c.gl.generateMipmap(c.gl.TEXTURE_2D);
            this.loaded = true;
        });
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public bind() {
        c.gl.bindTexture(c.gl.TEXTURE_2D, this.texture);
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

}
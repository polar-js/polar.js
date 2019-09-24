import Shader from './Shader';

/** Stores a number of shaders. */
export default class ShaderLibrary {
    private shaders: { [id: string]: Shader };

    /**
     * Add a shader to be stored in the shader library.
     * @param {Shader} shader The shader to add.
     * @param {string} [name] The name used to access the shader (optional).
     */
    public add(shader: Shader, name: string = null): void {
        if (!name) {
            name = shader.getName();
        }
        console.assert(!(name in this.shaders), 'Shader already exists!');

        this.shaders[name] = shader;
    }

    public async load(filepath: string, name: string = null): Promise<Shader> {
        const shader = await Shader.loadFromFetch(filepath, name);
        this.add(shader, name);
        return shader;
    }
}
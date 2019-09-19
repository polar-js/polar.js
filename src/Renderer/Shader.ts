import Canvas from './Canvas';

function shaderTypeFromString(type: string): number {
    if (type == "vertex")
        return Canvas.gl.VERTEX_SHADER;
    if (type == "fragment" || type == "pixel")
        return Canvas.gl.FRAGMENT_SHADER;
}

export default class Shader {
    private rendererID: WebGLProgram;
    private name: string;

    public constructor(name: string, vertexSrc: string, fragmentSrc: string) {
        this.name = name;

        this.compile({[shaderTypeFromString("vertex")]: vertexSrc, [shaderTypeFromString("fragment")]: fragmentSrc});
    }

    private compile(shaderSources: {[id: number]: string}) {
        let program: WebGLProgram = Canvas.gl.createProgram();
        let shaderIDs: WebGLShader[] = []
        let glShaderIDIndex = 0;
        for (let type in shaderSources) {
            const source = shaderSources[type];

            const shader = Canvas.gl.createShader(Number(type));
            Canvas.gl.shaderSource(shader, source);
            Canvas.gl.compileShader(shader);

            const log = Canvas.gl.getShaderInfoLog(shader);
            if (log != '' && log != null) {
                Canvas.gl.deleteShader(shader);
                console.log(log);
                console.assert(false, "Shader compilation error!");
                break;
            }

            Canvas.gl.attachShader(program, shader);
            shaderIDs.push(shader);
        }

        Canvas.gl.linkProgram(program);

        const log = Canvas.gl.getProgramInfoLog(program);
        if (log != '' && log != null) {
            Canvas.gl.deleteProgram(program);

            for (const id of shaderIDs) {
                Canvas.gl.deleteShader(id);
            }

            console.log(log);
            console.assert(false, "Program link failure!");
            return;
        }

        for (const id of shaderIDs) 
            Canvas.gl.detachShader(program, id);
        
        this.rendererID = program;
    }

    public bind(): void {
        Canvas.gl.useProgram(this.rendererID);
    }

    public unbind(): void {
        Canvas.gl.useProgram(0);
    }

    public getAttribLocation(name: string): number {
        return Canvas.gl.getAttribLocation(this.rendererID, name);
    }
}
import Canvas from './Canvas';
import { vec2, vec3, vec4, mat3, mat4 } from 'gl-matrix';

function shaderTypeFromString(type: string): number {
    if (type == "vertex")
        return Canvas.gl.VERTEX_SHADER;
    if (type == "fragment" || type == "pixel")
        return Canvas.gl.FRAGMENT_SHADER;
}

export default class Shader {
    private rendererID: WebGLProgram;
    private name: string;
    private locations: { [id: string]: WebGLUniformLocation };

    public constructor(name: string, vertexSrc: string, fragmentSrc: string) {
        this.name = name;
        this.locations = {};

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

    private getUniformLocation(name: string): WebGLUniformLocation {
        if (name in this.locations) {
            return this.locations[name];
        }
        else {
            const location = Canvas.gl.getUniformLocation(this.rendererID, name);
            this.locations[name] = location;
            return location;
        }
    }

    public uploadUniformInt(name: string, value: number) {
        Canvas.gl.uniform1i(this.getUniformLocation(name), value);
    }

    public uploadUniformFloat(name: string, value: number) {
        Canvas.gl.uniform1f(this.getUniformLocation(name), value);
    }

    public uploadUniformFloat2(name: string, value: vec2) {
        Canvas.gl.uniform2f(this.getUniformLocation(name), value[0], value[1]);
    }

    public uploadUniformFloat3(name: string, value: vec3) {
        Canvas.gl.uniform3f(this.getUniformLocation(name), value[0], value[1], value[2]);
    }

    public uploadUniformFloat4(name: string, value: vec4) {
        Canvas.gl.uniform4f(this.getUniformLocation(name), value[0], value[1], value[2], value[3]);
    }

    public uploadUniformMat3(name: string, value: mat3) {
        Canvas.gl.uniformMatrix3fv(this.getUniformLocation(name), false, value);
    }

    public uploadUniformMat4(name: string, value: mat4) {
        Canvas.gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
    }
}
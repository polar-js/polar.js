export function getVertexSource(): string { 
	return `#version 300 es
	precision highp float;

	layout(location = 0) in vec3 a_Position;
	layout(location = 1) in vec2 a_TexCoord;

	out vec2 v_TexCoord;

	void main() {
		v_TexCoord = a_TexCoord;
		gl_Position = vec4(a_Position, 1.0);
	}`;
}

export function getFragmentSource(): string {
	return `#version 300 es
	precision mediump float;
	out vec4 color;
	
	in vec2 v_TexCoord;

	uniform sampler2D u_Texture;
	uniform float u_Brightness;

	void main() {
		color = vec4(vec3(texture(u_Texture, v_TexCoord)) * (1.0 - distance(vec2(0.5, 0.5), v_TexCoord) / u_Brightness), 1.0);
	}`;
}
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

	uniform float u_Intensity;

	uniform sampler2D u_Texture;

	void main() {

		float r = texture(u_Texture, v_TexCoord - (v_TexCoord - 0.5) * u_Intensity).r;
		float g = texture(u_Texture, v_TexCoord).g;
		float b = texture(u_Texture, v_TexCoord + (v_TexCoord - 0.5) * u_Intensity).b;

		color = vec4(r, g, b, 1.0);
	}`;
}
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

	uniform sampler2D u_SpriteTexture;
	uniform sampler2D u_LightTexture;

	void main() {
		vec4 spriteColor = texture(u_SpriteTexture, v_TexCoord);
		vec4 lightColor = texture(u_LightTexture, v_TexCoord);

		color = vec4(spriteColor.x * lightColor.x, spriteColor.y * lightColor.y, spriteColor.z * lightColor.z, 1.0);
	}`;
}
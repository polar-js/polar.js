export function getVertexSource(): string { 
	return `#version 300 es
	precision highp float;

	layout(location = 0) in mat4 a_Transform;
	layout(location = 4) in vec4 a_AtlasBounds;

	layout(location = 5) in vec2 a_Position;
	layout(location = 6) in vec2 a_TexCoord;

	uniform mat4 u_ViewProjection;

	out vec4 v_AtlasBounds;
	out vec2 v_TexCoord;

	void main() {
		v_AtlasBounds = a_AtlasBounds;
		v_TexCoord = a_TexCoord;
		gl_Position = u_ViewProjection * a_Transform * vec4(a_Position, 0.0, 1.0);
	}`;
}

export function getFragmentSource(): string {
	return `#version 300 es
	precision mediump float;
	out vec4 color;


	in vec4 v_AtlasBounds;
	in vec2 v_TexCoord;

	uniform sampler2D u_Texture;

	void main() {
		color = texture(u_Texture, vec2(v_AtlasBounds.x + v_AtlasBounds.z * v_TexCoord.x, v_AtlasBounds.y + v_AtlasBounds.w * v_TexCoord.y));
	}`;
}
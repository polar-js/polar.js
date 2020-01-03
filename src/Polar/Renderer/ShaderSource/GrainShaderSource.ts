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
	uniform float u_Variant;

	uniform sampler2D u_Texture;

	float random(vec2 p)
	{
		vec2 K1 = vec2(
			23.14069263277926, // e^pi (Gelfond's constant)
			2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
		);
		return fract(cos(dot(p, K1)) * 12345.6789 );
	}

	void main() {
		color = texture(u_Texture, v_TexCoord);
		vec2 coords = v_TexCoord;
		coords.y *= random(vec2(coords.y, u_Variant));
		color.rgb += random(coords) * u_Intensity;
	}
	`;
}
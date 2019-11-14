export function getVertexSource(): string { 
	return `#version 300 es
	precision highp float;

	layout(location = 0) in vec2 a_Position;
	layout(location = 1) in vec3 a_Color;
	layout(location = 2) in float a_Intensity;
	layout(location = 3) in float a_Radius;

	layout(location = 4) in vec2 a_VertPosition;

	uniform mat4 u_ViewProjection;

	out vec2 v_FragPosition;
	out vec2 v_Position;
	out vec3 v_Color;
	out float v_Intensity;
	out float v_Radius;

	void main() {
		v_FragPosition = a_VertPosition;
		v_Position = a_Position;
		v_Color = a_Color;
		v_Intensity = a_Intensity;
		v_Radius = a_Radius;
		gl_Position = u_ViewProjection * vec4(a_VertPosition * a_Radius * 2.0 + a_Position, 0.0, 1.0);
	}`;
}

export function getFragmentSource(): string {
	return `#version 300 es
	precision mediump float;
	out vec4 color;
	
	in vec2 v_FragPosition;
	in vec2 v_Position;
	in vec3 v_Color;
	in float v_Intensity;
	in float v_Radius;
	
	uniform float[11] u_Kernel;

	void main() {

		float step = v_Radius / 10.0;
		float dist = length(v_FragPosition) * v_Radius * 2.0;
		int index = int(floor(dist / step));
		
		color = vec4(v_Color, mix(u_Kernel[index], u_Kernel[index + 1], mod(dist, step) / step) * v_Intensity);
		//color = mix(texture(u_Texture, v_TexCoord), vec4(u_Color, 1.0), min(mix(u_Kernel[index], u_Kernel[index + 1], mod(dist, step) / step) * u_Intensity, 1.0));
	}`;
}
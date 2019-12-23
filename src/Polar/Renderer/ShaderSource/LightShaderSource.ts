export function getVertexSource(): string { 
	return `#version 300 es
	precision highp float;

	layout(location = 0) in mat4 a_Transform;
	layout(location = 4) in vec3 a_Color;
	layout(location = 5) in float a_Intensity;

	layout(location = 6) in vec2 a_Position;

	uniform mat4 u_ViewProjection;
	uniform int u_InstanceCount;

	out vec3 v_Color;
	out float v_Intensity;

	out vec2 v_Position;

	void main() {
		v_Color = a_Color;
		v_Intensity = a_Intensity;
		v_Position = a_Position;

		gl_Position = u_ViewProjection * a_Transform * vec4(a_Position, 0.1 * (float(gl_InstanceID) / float(u_InstanceCount)), 1.0);
	}`;
}

export function getFragmentSource(): string {
	return `#version 300 es
	precision mediump float;
	out vec4 color;
	
	in vec3 v_Color;
	in float v_Intensity;
	
	in vec2 v_Position;

	uniform float[11] u_Kernel;

	void main() {

		float step = 0.1;
		float dist = length(v_Position) * 2.0;
		int index = int(floor(dist / step));
		
		color = vec4(v_Color, mix(u_Kernel[index], u_Kernel[index + 1], mod(dist, step) / step) * v_Intensity);
	}`;
}
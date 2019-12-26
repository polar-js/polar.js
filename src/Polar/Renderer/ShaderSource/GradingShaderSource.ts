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

// Inspired by https://defold.com/tutorials/grading/
export function getFragmentSource(): string {
	return `#version 300 es
	#define LUT_WIDTH 256.0
	#define LUT_HEIGHT 16.0
	#define NUM_COLORS 16.0
	#define MAX_COLOR 15.0

	precision mediump float;
	out vec4 color;
	
	in vec2 v_TexCoord;

	uniform sampler2D u_Texture;
	uniform sampler2D u_LUT;


	void main() {
		vec4 px = texture2D(u_Texture, v_TexCoord);

		float cell = px.b * MAX_COLOR;

		float cell_l = floor(cell);
		float cell_h = ceil(cell);

		float half_px_x = 0.5 / LUT_WIDTH;
		float half_px_y = 0.5 / LUT_HEIGHT;
		float r_offset = half_px_x + px.r / NUM_COLORS * (MAX_COLOR / NUM_COLORS);
		float g_offset = half_px_y + px.g * (MAX_COLOR / NUM_COLORS);

		vec2 lut_pos_l = vec2(cell_l / NUM_COLORS + r_offset, g_offset);
		vec2 lut_pos_h = vec2(cell_h / NUM_COLORS + r_offset, g_offset);

		vec4 graded_color_l = texture2D(lut, lut_pos_l);
		vec4 graded_color_h = texture2D(lut, lut_pos_h);

		color = mix(graded_color_l, graded_color_h, fract(cell));
	}`;
}
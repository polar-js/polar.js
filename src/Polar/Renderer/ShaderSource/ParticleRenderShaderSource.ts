export function getVertexSource(): string { 
	return `#version 300 es
			precision mediump float;

			uniform float u_zIndex;
			uniform mat4 u_ViewProjection;
			
			layout(location = 0) in vec2 i_Position;
			layout(location = 1) in float i_Age;
			layout(location = 2) in float i_Life;
			layout(location = 3) in vec2 i_Velocity;

			void main() {
				i_Age;
				i_Life;
				i_Velocity;

				gl_PointSize = 2.0;
				gl_Position = u_ViewProjection * vec4(i_Position, u_zIndex, 1.0);
			}
			`;
}
export function getFragmentSource(): string {
	return `#version 300 es
			precision mediump float;

			out vec4 o_FragColor;

			void main() {
				// TODO: different colors / textures etc.
				o_FragColor = vec4(1.0);
			}
	`;
}

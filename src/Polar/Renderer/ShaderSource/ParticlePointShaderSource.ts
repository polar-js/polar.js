export function getVertexSource(): string { 
	return `#version 300 es
			precision mediump float;

			uniform float u_zIndex;
			uniform mat4 u_ViewProjection;
			
			layout(location = 0) in vec2 i_Position;
			layout(location = 1) in float i_Age;
			layout(location = 2) in float i_Life;
			layout(location = 3) in vec2 i_Velocity;

			out float v_TimeLeft;

			void main() {
				v_TimeLeft = i_Life - i_Age;
				i_Velocity;

				gl_PointSize = 2.0;
				gl_Position = u_ViewProjection * vec4(i_Position, u_zIndex, 1.0);
			}
			`;
}
export function getFragmentSource(): string {
	return `#version 300 es
			precision mediump float;

			uniform float u_FadeTime;

			in float v_TimeLeft;

			out vec4 o_FragColor;

			void main() {
				float opacity = 1.0;
				if (u_FadeTime > 0.0) {
					opacity = min(v_TimeLeft / u_FadeTime, 1.0);
				}

				// TODO: different colors / textures etc.
				o_FragColor = vec4(1.0, 1.0, 1.0, opacity);
			}
	`;
}

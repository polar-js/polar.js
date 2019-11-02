export function getVertexSource(): string { 
	return `#version 300 es
			precision mediump float;

			uniform float u_Scale;
			uniform float u_ShrinkTime;
			uniform float u_zIndex;
			uniform mat4 u_ViewProjection;
			
			layout(location = 0) in vec2 i_Position;
			layout(location = 1) in float i_Age;
			layout(location = 2) in float i_Life;
			layout(location = 3) in vec2 i_Velocity;

			layout(location = 4) in vec2 i_Coord;
			layout(location = 5) in vec2 i_TexCoord;

			out float v_TimeLeft;
			out vec2 v_TexCoord;
			out vec2 v_Position;

			void main() {
				v_TimeLeft = i_Life - i_Age;
				v_TexCoord = i_TexCoord;
				i_Velocity;
				v_Position = i_Position;

				vec2 vert_coord;
				if (u_ShrinkTime > 0.0) {
					vert_coord = i_Position + min((v_TimeLeft / u_ShrinkTime) * u_Scale, u_Scale) * i_Coord;
				}
				else {
					vert_coord = i_Position + u_Scale * i_Coord;
				}

				gl_Position = u_ViewProjection * vec4(vert_coord, u_zIndex, 1.0);
			}
			`;
}
export function getFragmentSource(): string {
	return `#version 300 es
			precision mediump float;

			uniform float u_FadeTime;
			uniform sampler2D u_Texture;

			in float v_TimeLeft;
			in vec2 v_TexCoord;
			in vec2 v_Position;

			out vec4 o_FragColor;

			void main() {
				float opacity = 1.0;
				if (u_FadeTime > 0.0) {
					opacity = min(v_TimeLeft / u_FadeTime, 1.0);
				}

				o_FragColor = texture(u_Texture, v_TexCoord) * vec4(1.0, 1.0, 1.0, opacity);
			}
	`;
}

export function getVertexSource(): string { 
	return `#version 300 es
			precision mediump float;

			uniform float u_DeltaTime;
			uniform sampler2D u_RandNoise;
			uniform vec2 u_Gravity;
			uniform vec2 u_Origin;

			uniform float u_Angle;
			uniform float u_Spread;

			uniform float u_MinSpeed;
			uniform float u_MaxSpeed;

			layout(location = 0) in vec2 i_Position;
			layout(location = 1) in float i_Age;
			layout(location = 2) in float i_Life;
			layout(location = 3) in vec2 i_Velocity;

			/*layout(location = 0)*/ out vec2 v_Position;
			/*layout(location = 1)*/ out float v_Age;
			/*layout(location = 2)*/ out float v_Life;
			/*layout(location = 3)*/ out vec2 v_Velocity;

			void main() {
				if (i_Age >= i_Life) {

					// Generate randomness.
					ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
					vec2 rand = texelFetch(u_RandNoise, noise_coord, 0).rg;

					float angle = (rand.r - 0.5) * u_Spread + u_Angle;

					vec2 direction = vec2(cos(angle), sin(angle));

					v_Position = u_Origin;
					v_Age = 0.0;
					v_Life = i_Life;
					v_Velocity = direction * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
				}
				else {
					v_Position = i_Position + i_Velocity * u_DeltaTime;
					v_Age = i_Age + u_DeltaTime;
					v_Life = i_Life;
					v_Velocity = i_Velocity + u_Gravity * u_DeltaTime;
				}
			}
			`;
}
export function getFragmentSource(): string {
	return `#version 300 es
			precision mediump float;
			
			void main() {
				discard;
			}`;
}

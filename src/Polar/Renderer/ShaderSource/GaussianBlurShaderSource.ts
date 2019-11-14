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

	uniform sampler2D u_Texture;
	uniform int u_KernelSize;
	uniform bool u_Horizontal;
	uniform float u_Weights[5];
	uniform float u_Spread;

	void main() {

		vec2 tex_offset = 1.0 / vec2(textureSize(u_Texture, 0));
    	vec3 result = texture(u_Texture, v_TexCoord).rgb * u_Weights[0];
		
		if(u_Horizontal)
		{
			for(float i = 1.0; i < ceil(float(u_KernelSize) / 2.0); i++)
			{
				result += texture(u_Texture, v_TexCoord + vec2(tex_offset.x * i * u_Spread, 0.0)).rgb * u_Weights[int(i)];
				result += texture(u_Texture, v_TexCoord - vec2(tex_offset.x * i * u_Spread, 0.0)).rgb * u_Weights[int(i)];
			}
		}
		else
		{
			for(float i = 1.0; i < ceil(float(u_KernelSize) / 2.0); i++)
			{
				result += texture(u_Texture, v_TexCoord + vec2(0.0, tex_offset.y * i * u_Spread)).rgb * u_Weights[int(i)];
				result += texture(u_Texture, v_TexCoord - vec2(0.0, tex_offset.y * i * u_Spread)).rgb * u_Weights[int(i)];
			}
		}

		color = vec4(result, 1.0);
	}`;
}
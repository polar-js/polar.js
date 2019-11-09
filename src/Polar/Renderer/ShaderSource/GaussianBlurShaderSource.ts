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
	uniform bool u_Horizontal;
	uniform float u_Weights[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

	void main() {

		vec2 tex_offset = 1.0 / textureSize(u_Texture, 0); // gets size of single texel.
    	vec3 result = texture(image, v_TexCoord).rgb * u_Weights[0]; // current fragment's contribution
		
		if(horizontal)
		{
			for(int i = 1; i < 5; ++i)
			{
				result += texture(u_Texture, v_TexCoord + vec2(tex_offset.x * i, 0.0)).rgb * u_Weights[i];
				result += texture(u_Texture, v_TexCoord - vec2(tex_offset.x * i, 0.0)).rgb * u_Weights[i];
			}
		}
		else
		{
			for(int i = 1; i < 5; ++i)
			{
				result += texture(u_Texture, v_TexCoord + vec2(0.0, tex_offset.y * i)).rgb * u_Weights[i];
				result += texture(u_Texture, v_TexCoord - vec2(0.0, tex_offset.y * i)).rgb * u_Weights[i];
			}
		}

		color = vec4(result, 1.0);
	}`;
}
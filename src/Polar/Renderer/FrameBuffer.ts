import { Surface as s} from 'Polar/Renderer/Surface';
import { Texture2D } from 'Polar/Renderer/Texture';
import { RenderBuffer } from 'Polar/Renderer/RenderBuffer';

export class FrameBuffer {

	private framebuffer: WebGLFramebuffer;
	private texture: Texture2D;
	private renderbuffer: RenderBuffer;

	public constructor() {
		this.framebuffer = s.gl.createFramebuffer();
	}

	public bind(target: number = s.gl.FRAMEBUFFER) {
		s.gl.bindFramebuffer(target, this.framebuffer);
	}

	public unbind(target: number = s.gl.FRAMEBUFFER) {
		s.gl.bindFramebuffer(target, null);
	}

	public attachTexture(texture: Texture2D, attachment: number, fbTarget: number = s.gl.FRAMEBUFFER, textureTartget: number = s.gl.TEXTURE_2D) {
		s.gl.bindFramebuffer(fbTarget, this.framebuffer);
		s.gl.framebufferTexture2D(fbTarget, attachment, textureTartget, texture.getGLTexture(), 0);
		this.texture = texture;
	}

	public attachRenderbuffer(renderbuffer: RenderBuffer, attachment: number = s.gl.DEPTH_STENCIL_ATTACHMENT, target: number = s.gl.FRAMEBUFFER, renderbufferTarget: number = s.gl.RENDERBUFFER) {
		s.gl.framebufferRenderbuffer(target, attachment, renderbufferTarget, renderbuffer.getGLRenderbuffer());
		this.renderbuffer = renderbuffer;
	}

	public isComplete(target: number = s.gl.FRAMEBUFFER): boolean {
		return s.gl.checkFramebufferStatus(target) === s.gl.FRAMEBUFFER_COMPLETE;
	}

	public getTexture(): Texture2D {
		return this.texture;
	}

	public getRenderbuffer(): RenderBuffer {
		return this.renderbuffer;
	}
}
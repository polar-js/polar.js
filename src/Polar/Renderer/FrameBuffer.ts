import { Surface as s } from './Surface';
import { Texture2D } from './Texture';
import { RenderBuffer } from './RenderBuffer';

/** Represents an OpenGL framebuffer. */
export class FrameBuffer {

	private framebuffer: WebGLFramebuffer;
	private texture: Texture2D;
	private renderbuffer: RenderBuffer;

	private textureAttachment: number;
	private fbTarget: number;
	private textureTarget: number;

	private rbAttachment: number;
	private rbTarget: number;
	private rbRenderBufferTarget: number;

	/** Create a new framebuffer. */
	public constructor() {
		this.framebuffer = s.gl.createFramebuffer();
	}

	/** Bind the OpenGL framebuffer.
	 * @param {number} [target=FRAMEBUFFER] The OpenGL target.
	 */
	public bind(target: number = s.gl.FRAMEBUFFER) {
		s.gl.bindFramebuffer(target, this.framebuffer);
	}

	/** Unbind the OpenGL framebuffer.
	 * @param {number} [target=FRAMEBUFFER] The OpenGL target.
	*/
	public unbind(target: number = s.gl.FRAMEBUFFER) {
		s.gl.bindFramebuffer(target, null);
	}

	/** Attach a texture to the framebuffer.
	 * @param {Texture2D} texture The texture.
	 * @param {number} attachment The OpenGL attachment.
	 * @param {number} [fbTarget=FRAMEBUFFER] The OpenGL framebuffer target.
	 * @param {number} [textureTarget=TEXTURE_2D] The OpenGL texture target.
	 */
	public attachTexture(texture: Texture2D, attachment: number, fbTarget: number = s.gl.FRAMEBUFFER, textureTartget: number = s.gl.TEXTURE_2D) {
		s.gl.bindFramebuffer(fbTarget, this.framebuffer);
		s.gl.framebufferTexture2D(fbTarget, attachment, textureTartget, texture.getGLTexture(), 0);
		this.texture = texture;
		this.textureAttachment = attachment;
		this.fbTarget = fbTarget;
		this.textureTarget = textureTartget;
	}

	/** Attach a render buffer to the framebuffer.
	 * @param {RenderBuffer} renderbuffer The renderbuffer.
	 * @param {number} [attachment=DEPTH_STENCIL_ATTACHMENT] The OpenGL attachment.
	 * @param {number} [target=FRAMEBUFFER] The OpenGL target.
	 * @param {number} [renderbufferTarget=RENDERBUFFER] The OpenGL renderbuffer target.
	 */
	public attachRenderbuffer(renderbuffer: RenderBuffer, attachment: number = s.gl.DEPTH_STENCIL_ATTACHMENT, target: number = s.gl.FRAMEBUFFER, renderbufferTarget: number = s.gl.RENDERBUFFER) {
		s.gl.framebufferRenderbuffer(target, attachment, renderbufferTarget, renderbuffer.getGLRenderbuffer());
		this.renderbuffer = renderbuffer;
		this.rbAttachment = attachment;
		this.rbTarget = target;
		this.rbRenderBufferTarget = renderbufferTarget;
	}

	/** Check if the framebuffer is complete.
	 * @returns {boolean} Whether it is complete.
	 */
	public isComplete(target: number = s.gl.FRAMEBUFFER): boolean {
		return s.gl.checkFramebufferStatus(target) === s.gl.FRAMEBUFFER_COMPLETE;
	}

	/** Get the texture.
	 * @returns {Texture2D} The texture.
	 */
	public getTexture(): Texture2D {
		return this.texture;
	}

	/** Get the renderbuffer
	 * @returns {RenderBuffer} The renderbuffer.
	 */
	public getRenderbuffer(): RenderBuffer {
		return this.renderbuffer;
	}

	public resize(width: number, height: number) {
		s.gl.deleteFramebuffer(this.framebuffer);
		this.framebuffer = s.gl.createFramebuffer();
		this.bind();

		if (this.texture) {
			this.texture.loadEmpty(width, height, s.gl.RGBA);
			s.gl.framebufferTexture2D(this.fbTarget, this.textureAttachment, this.textureTarget, this.texture.getGLTexture(), 0);
		}
		
		if (this.renderbuffer) {
			this.renderbuffer.resize(width, height);
			s.gl.framebufferRenderbuffer(this.rbTarget, this.rbAttachment, this.rbRenderBufferTarget, this.renderbuffer.getGLRenderbuffer());
		}

	}
}
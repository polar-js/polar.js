import { ParticleEmitter } from 'Polar/Renderer/ParticleEmitter';
import { System } from 'Polar/ECS/System';
import { Component} from 'Polar/ECS/Component';
import { Entity } from 'Polar/ECS/Entity';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { CameraCP } from 'Polar/ECS/Components';

export class ParticleSystem extends System {
	public onAttach(): void {}

	public beginUpdate(dt: number): void {
		ParticleRenderer.beginParticleScene((<CameraCP>this.getManager().getSingleton('Polar:Camera')).camera);
	}
	
	public onEntityUpdate(dt: number, entity: Entity, subIndex: number): void {
		ParticleRenderer.renderParticleEmitter((<ParticleEmitterCP>entity.getComponent('Polar:ParticleEmitter')).emitter, dt);
	}

	public endUpdate(dt: number): void {
		ParticleRenderer.endParticleScene();
	}

	public getComponentTuples(): string[][] {
		return [['Polar:ParticleEmitter']];
	}

	public getName(): string { return 'Polar:ParticleSystem'; }
}

export class ParticleEmitterCP extends Component {
	
	public readonly type = 'Polar:ParticleEmitter';
	/** The particle emitter. */
	public emitter: ParticleEmitter;

	/** Create a new particle emitter component.
	 * @param {ParticleEmitter} emitter The emitter.
	 */
	public constructor(emitter: ParticleEmitter) {
		super();
		this.emitter = emitter;
	}

}
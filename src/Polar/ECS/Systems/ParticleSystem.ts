import { ParticleEmitter } from 'Polar/Renderer/ParticleEmitter';
import { System, Component, Entity } from 'Polar/ECS/ECS';
import { ParticleRenderer } from 'Polar/Renderer/ParticleRenderer';
import { CameraCP } from 'Polar/ECS/Components';

export class ParticleSystem extends System {
	public onAttach(): void {}

	public beginUpdate(dt: number): void {
		ParticleRenderer.beginParticleScene((<CameraCP>this.manager.getSingleton('Polar:Camera')).camera);
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

	public emitter: ParticleEmitter;

	public constructor(emitter: ParticleEmitter) {
		super();
		this.emitter = emitter;
	}

	public getType(): string { return 'Polar:ParticleEmitter'; }
}
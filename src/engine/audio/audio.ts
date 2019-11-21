import { Weapon } from '../../assets/weapons/core';
import { Shotgun } from '../../assets/weapons/shotgun/shotgun';

export const Sounds: {[key: string]: string} = {
	HIT_NPC: require('./hit_sharp.mp3'),
	HIT_WORLD: require('./hit.mp3'),
	JUMP: require('./jump.mp3'),
	LAND: require('./land.mp3'),
	NOTICE: require('./notice.mp3'),
	WTF: require('./wtf.mp3'),
	AUCH_ENEMY: require('./auch_enemy.mp3'),
	AUCH_PLAYER: require('./auch_player.mp3'),
	GUN: require('./gun.mp3'),
	SHOTGUN: require('./shotgun.mp3'),
	GUN_RELOAD: require('./gun_reload.mp3'),
	SUB_RELOAD: require('./sub_reload.mp3'),
	SHOT_RELOAD: require('./shot_reload.mp3'),
	TOM_KLIKK: require('./tom_klikk.mp3')
}

export class AudioEngine {
	constructor(){}

	public playSound(src: string): void {
		let p = new Audio(src);
		setTimeout(() => {
			p.remove();
		}, p.duration);
		p.play();
	}

	public hit_npc(): void {
		this.playSound(Sounds.HIT_NPC);
	}

	public hit_world(): void {
		this.playSound(Sounds.HIT_WORLD)
	}

	public hit_player(): void {
		this.playSound(Sounds.AUCH_PLAYER);
	}

	public hit_enemy(): void {
		this.playSound(Sounds.AUCH_ENEMY);
	}

	public jump(): void {
		this.playSound(Sounds.JUMP)
	}

	public land(): void {
		this.playSound(Sounds.LAND);
	}

	public shoot(w: Weapon): void {
		if (w instanceof Shotgun){
			this.playSound(Sounds.SHOTGUN);
		} else {
			this.playSound(Sounds.GUN);
		}
	}
}
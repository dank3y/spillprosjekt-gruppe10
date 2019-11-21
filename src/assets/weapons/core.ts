import { Sprite, NPC } from '../entities/core';

export interface Shoot {
	shoot: Function;
}

/**
 * RPM - Skudd/minutt
 */
export class Weapon extends Sprite implements Shoot {
	public leftInMag: number;
	public lastBullet: number = 0;
	public reloadStart: number = 0;
	public reloading: boolean = false;

	constructor(
		x: number,
		y: number,
		_sprite: string,
		width: number,
		height: number,
		public magSize: number,
		public reloadTime: number,
		public RPM: number,
		public recoil: number,
		public title: string
	) {
		super(x, y, _sprite, width, height);
		this.leftInMag = this.magSize;
	}

	// Antall ms mellom hvert skudd for en gitt RPM.
	get RPMms() {
		return (60 / this.RPM) * 1000;
	}

	public shoot(list: Projectile[], shooter: NPC): void {};
}

/**
 * g 	- 	hvor mye prosjektilet skal falle.
 * vel 	- 	hastighet
 */
export class Projectile extends Sprite {
	public hit: (target: any) => void = () => { }

	constructor(
		x: number,
		y: number,
		_sprite: string,
		width: number,
		height: number,
		public angle: number,
		public g: number,
		public vel: number,
		public shooter: InstanceType<typeof NPC>,
		public damage: number = 34
	) {
		super(x, y, _sprite, width, height,);
	}

	update(){
		this.x += Math.cos(this.angle) * this.vel;
		this.y += Math.sin(this.angle) * this.vel;
	}
}
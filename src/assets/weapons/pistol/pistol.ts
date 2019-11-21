import { Weapon, Projectile } from '../core';
import { NPC } from '../../entities/core';
import { LightProjectile } from '../projectiles/light/light-projectile';

const sprite = require('./sprite.png')

const width = 23;
const height = 22;
const magSize = 15;
const reloadTime = 1.5;
const ROF = 250;
const recoil = 10;
const vel = 20;

export class Pistol extends Weapon {
	_shoot(list: Projectile[], shooter: NPC): void {
		let angle = shooter.angle + (0.10 * Math.random() - 0.05);
		const proj = new LightProjectile(
			shooter.x,
			shooter.y,
			angle,
			vel,
			shooter
		);
		list.push(proj);
	}
	
	constructor(
		x: number,
		y: number
	){
		super(x, y, sprite, width, height, magSize, reloadTime, ROF, recoil, 'Pistol');
		super.shoot = this._shoot;
	}
}
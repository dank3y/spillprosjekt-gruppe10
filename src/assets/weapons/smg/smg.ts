import { Weapon, Projectile } from '../core';
import { NPC } from '../../entities/core';
import { LightProjectile } from '../projectiles/light/light-projectile';

const sprite = require('./sprite.png');

const width = 58;
const height = 22;
const magSize = 30;
const reloadTime = 2.5;
const RPM = 650;
const recoil = 5;
const vel = 30;

export class SMG extends Weapon{
	_shoot(list: Projectile[], shooter: NPC): void {
		let angle = shooter.angle + (0.05 * Math.random() - 0.025);
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
		super(x, y, sprite, width, height, magSize, reloadTime, RPM, recoil, 'SMG');
		super.shoot = this._shoot;
	}
}
import { Weapon, Projectile } from '../core';
import { NPC } from '../../entities/core';
import { LightProjectile } from '../projectiles/light/light-projectile';

const sprite = require('./sprite.png')

const width = 58;
const height = 22;
const magSize = 5;
const reloadTime = 0.8;
const ROF = 100;
const recoil = 20;
const vel = 20;
const projectiles = 5;

export class Shotgun extends Weapon {
	_shoot(list: Projectile[], shooter: NPC): void {
		for(let i: number = 0; i < projectiles; i++) {
			let angle = shooter.angle + (0.5 * Math.random() - 0.25);
			const proj = new LightProjectile(
				shooter.x,
				shooter.y,
				angle,
				vel,
				shooter
			);
			list.push(proj);
		} 
	}
	
	constructor(
		x: number,
		y: number
	){
		super(x, y, sprite, width, height, magSize, reloadTime, ROF, recoil, 'Shotgun');
		super.shoot = this._shoot;
	}
}
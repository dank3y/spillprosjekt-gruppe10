import { Weapon, Projectile } from "../core";
import { NPC, GameObject } from "../../entities/core";
import { LightProjectile } from "../projectiles/light/light-projectile";

const sprite = require('./sprite.png')

const recoil = 20;
const magSize = 5;
const reloadTime = 0.8;
const ROF = 100;
const width = 64;
const height = 32;
const g = 1;
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
    y: number,
  ){
    super(x, y, sprite, magSize, reloadTime, ROF, recoil, width, height);
    super.shoot = this._shoot;
  }


}
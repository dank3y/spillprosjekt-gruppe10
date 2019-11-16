import { Weapon, Projectile } from "../core";
import { NPC, GameObject } from "../../entities/core";
import { LightProjectile } from "../projectiles/light/light-projectile";

const sprite = require('./sprite.png')

const recoil = 10;
const magSize = 15;
const reloadTime = 1.5;
const ROF = 250;
const width = 33;
const height = 20;
const g = 1;
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
    y: number,
  ){
    super(x, y, sprite, magSize, reloadTime, ROF, recoil, width, height);
    super.shoot = this._shoot;
  }


}
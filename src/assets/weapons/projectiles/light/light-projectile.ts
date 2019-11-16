import { Projectile } from "../../core";
import { NPC } from "../../../entities/core";

const _sprite = require('./sprite');
const width = 10;
const height = 4;

const g = 1;

export class LightProjectile extends Projectile {
    constructor(
        x: number,
        y: number,
        angle: number,
        vel: number,
        shooter: InstanceType<typeof NPC>
        ){
        super(x, y, _sprite, width, height, angle, g, vel, shooter);
    }
}
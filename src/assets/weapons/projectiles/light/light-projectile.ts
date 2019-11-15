import { Projectile } from "../../core";
import { NPC } from "../../../entities/core";

const _sprite = require('./sprite');


export class LightProjectile extends Projectile {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        angle: number,
        g: number,
        vel: number,
        shooter: InstanceType<typeof NPC>
        ){
        super(x, y, _sprite, width, height, angle, g, vel, shooter);
    }
}
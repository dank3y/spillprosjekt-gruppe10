import { Projectile } from "../../core";

const _sprite = require('./sprite');


export class LightProjectile extends Projectile {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        angle: number,
        g: number,
        vel: number
        ){
        super(x, y, _sprite, width, height, angle, g, vel);
    }
}
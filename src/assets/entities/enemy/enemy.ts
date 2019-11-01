import { NPC } from "../../core";
const sprite = require('./sprite.png');

export class Enemy extends NPC {
    constructor(
        x: number,
        y: number,
        width?: number,
        height?: number,
        mass?: number,
        vx: number = 0,
        vy: number = 0,
        angle: number = 0,){
        super(x, y, sprite, width, height, mass, vx, vy, angle);               
    }
}
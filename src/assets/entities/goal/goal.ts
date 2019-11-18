import { Sprite } from "../core";
const sprite = require('./sprite.png');

export class Goal extends Sprite {
    constructor(
        x: number,
        y: number,
        width: number,
        height: number){
        super(x, y, sprite, width, height);               
    }
}
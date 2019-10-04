import { Sprite } from "../../core";
const sprite = require('./sprite.png');

export class Dummy extends Sprite {
    constructor(
        x: number,
        y: number,
        width?: number,
        height?: number
    ){
        super(x, y, sprite, width, height);
    }
}
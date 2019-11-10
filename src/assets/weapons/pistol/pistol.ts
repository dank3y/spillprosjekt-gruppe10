import { Weapon } from "../core";

const sprite = require('./sprite.png')


const magSize = 15;
const reloadTime = 1.5;
const ROF = 500;

export class Pistol extends Weapon {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number
  ){
    super(x, y, sprite, magSize, reloadTime, ROF, width, height);
  }
}
import { NPC } from '../core';
const sprite = require('./sprite.png');
const _walk0:string = require('./walk0.png');
const _walk1:string = require('./walk1.png');
const _walk2:string = require('./walk2.png');
const _walk3:string = require('./walk3.png');
const _walk4:string = require('./walk4.png');
const _walk5:string = require('./walk5.png');
const _walk6:string = require('./walk6.png');
const _walk7:string = require('./walk7.png');

export class Player extends NPC {
	private stand: HTMLImageElement = super.createSpriteImage(sprite);
	private walk0: HTMLImageElement = super.createSpriteImage(_walk0);
	private walk1: HTMLImageElement = super.createSpriteImage(_walk1);
	private walk2: HTMLImageElement = super.createSpriteImage(_walk2);
	private walk3: HTMLImageElement = super.createSpriteImage(_walk3);
	private walk4: HTMLImageElement = super.createSpriteImage(_walk4);
	private walk5: HTMLImageElement = super.createSpriteImage(_walk5);
	private walk6: HTMLImageElement = super.createSpriteImage(_walk6);
	private walk7: HTMLImageElement = super.createSpriteImage(_walk7);
	private walkSq:HTMLImageElement[] = [this.walk0, this.walk1, this.walk2, this.walk3, this.walk4, this.walk5, this.walk6, this.walk7];

	public kills: number = 0;

	constructor(
		x: number,
		y: number,
		width?: number,
		height?: number,
		mass?: number,
		vx: number = 0,
		vy: number = 0,
		angle: number = 0,
	){
		super(x, y, sprite, width, height, mass, vx, vy, angle);
		this.d = false;
		this.healthMax = 1000;
		this.healthCurrent = this.healthMax;
	}

	public animate(): void {
		if(this.vy > 0.1 || this.vy < -0.1) {
			this.sprite = this.walk3;
		} else if(this.d && (this.angle < -Math.PI/2 || this.angle > Math.PI/2)) {
			if(this.aniTick > this.walkSq.length-1 || this.aniTick < 0) this.aniTick = this.walkSq.length-1;
			
			this.sprite = this.walkSq[this.aniTick];
			this.aniTick--;
		} else if(this.a && (this.angle >= -Math.PI/2 || this.angle <= Math.PI/2)) {
			if(this.aniTick > this.walkSq.length-1 || this.aniTick < 0) this.aniTick = this.walkSq.length-1;
			
			this.sprite = this.walkSq[this.aniTick];
			this.aniTick--;
		} else if(this.a || this.d) {
			if(this.aniTick > this.walkSq.length-1 || this.aniTick < 0) this.aniTick = 0;
			
			this.sprite = this.walkSq[this.aniTick];
			this.aniTick++;
		} else {
			this.sprite = this.stand;
			this.aniTick = 0;
		}
	}
}
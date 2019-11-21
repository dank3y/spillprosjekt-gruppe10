import { UIElement } from './UI-engine';
import { NPC } from '../../assets/entities/core';
import { Weapon } from '../../assets/weapons/core';

const CELL_FACTOR = 50;

export class Hotbar extends UIElement {
	private drawOutline(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0, 0, this.width, this.height);
		ctx.restore();
		ctx.closePath()
	}

	private drawActiveOutline(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		ctx.strokeStyle = '#F00';
		ctx.strokeRect(0 + this.target.currentWeaponIndex * CELL_FACTOR, 0, CELL_FACTOR, CELL_FACTOR);
		ctx.restore();
		ctx.closePath()
	}

	private drawBox(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = '#FFF';
		ctx.fillRect(0, 0, this.width, this.height)
		ctx.restore();
		ctx.closePath()
	}

	private drawWeapon(ctx: CanvasRenderingContext2D, weapon: Weapon): void {
		ctx.beginPath();
		ctx.save();
		ctx.translate(
			0.5 * CELL_FACTOR,
			0.5 * CELL_FACTOR
		);
		ctx.drawImage(
			weapon.sprite,
			-0.5 * CELL_FACTOR,
			-0.5 * CELL_FACTOR,
			CELL_FACTOR,
			CELL_FACTOR,
		);
		ctx.restore();
		ctx.closePath()
	}

	_draw(ctx: CanvasRenderingContext2D): void {
		this.drawBox(ctx);
		this.target.weapons.forEach((w, i) => {
			ctx.beginPath();
			ctx.save();
			ctx.translate(CELL_FACTOR * i, 0);
			this.drawWeapon(ctx, w);
			ctx.restore();
			ctx.closePath();
		});
		this.drawOutline(ctx);
		this.drawActiveOutline(ctx);
	}

	constructor(public target: InstanceType<typeof NPC>) {
		super(target.weapons.length * CELL_FACTOR, CELL_FACTOR, 'middle', 'end');
		super.draw = this._draw;
	}

	get numWeapons(): number { return this.target.weapons.length; }
}
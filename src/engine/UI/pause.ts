import { UIElement } from './UI-engine';

export class Pause extends UIElement {
	private drawBox(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = '#FFF';
		ctx.fillRect(
			0,
			0,
			this.width,
			this.height
		);
		ctx.restore();
		ctx.closePath();
	}

	private drawOutline(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0, 0, this.width, this.height)
		ctx.restore();
		ctx.closePath();
	}

	private drawText(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.save();
		let text = 'PAUSED';
		ctx.font = '40px gamefont';
		ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height / 2 + 15)
		ctx.restore();
		ctx.closePath();
	}

	_draw(ctx: CanvasRenderingContext2D): void {
		this.drawBox(ctx);
		this.drawText(ctx);
		this.drawOutline(ctx);
	}

	constructor() {
		super(300, 150, 'middle', 'middle');
		super.draw = this._draw;
	}
}
import { UIElement } from "./UI-engine";
import { NPC } from "../../assets/entities/core";

export class AmmoCounter extends UIElement{

    drawBox(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
        ctx.closePath();
    }

    drawOutline(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.strokeRect(1, 1, this.width, this.height)
        ctx.restore();
        ctx.closePath();
    }

    drawDesc(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.font = '26px gamefont';
        let text = 'AMMO';
        ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 40);
        ctx.restore();
        ctx.closePath();
    }

    drawAmmo(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.font = '30px gamefont';
        let text = `${this.target.weapon!.leftInMag}/${this.target.weapon!.magSize}`;
        ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 10)
        ctx.restore();
        ctx.closePath();
    }

    _draw(ctx: CanvasRenderingContext2D): void {
        // console.log(this.x);
        this.drawBox(ctx);
        this.drawAmmo(ctx);
        this.drawDesc(ctx);
        this.drawOutline(ctx);
    }

    constructor(public target: InstanceType<typeof NPC>){
        super(120, 70, 'end', 'end');
        super.draw = this._draw;
        
    }
}
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
        ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 60);
        ctx.restore();
        ctx.closePath();
    }
    drawTitle(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.font = '23px gamefont';
        let text = this.target.weapon.title;
        ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 90);
        ctx.restore();
        ctx.closePath();
    }
    drawAmmo(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.save();
        ctx.font = '30px gamefont';
        let text = `${this.target.weapon!.leftInMag}/${this.target.weapon!.magSize}`;
        ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 30)
        ctx.restore();
        ctx.closePath();
    }

    drawReloadProgress(ctx: CanvasRenderingContext2D){
        if (this.target.weapon.reloading){
            let factor = Number(((Date.now() - this.target.weapon.reloadStart) / (this.target.weapon.reloadTime * 1000)).toFixed(2));
            ctx.beginPath();
            ctx.save();
            ctx.fillStyle = '#000';
            ctx.fillRect(0.5 * (this.width - factor * 0.8 * this.width), this.height - 20, factor * 0.8 * this.width, 15);
            ctx.fillStyle = '#f00';
            let text = 'RELOADING';
            ctx.fillText(text, 0.5 * (this.width - ctx.measureText(text).width), this.height - 10);
            ctx.restore();
            ctx.closePath();
        }
    }

    _draw(ctx: CanvasRenderingContext2D): void {
        // console.log(this.x);
        this.drawBox(ctx);
        this.drawTitle(ctx);
        this.drawAmmo(ctx);
        this.drawDesc(ctx);
        this.drawReloadProgress(ctx);
        this.drawOutline(ctx);
    }

    constructor(public target: InstanceType<typeof NPC>){
        super(120, 120, 'end', 'end');
        super.draw = this._draw;
        
    }
}
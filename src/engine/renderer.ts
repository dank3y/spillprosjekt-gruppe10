import { Canvas } from "./canvas";
import { Sprite, GameObject } from "../assets/core";
import { Camera } from "./camera";
import { Player } from "../assets/entities/player/player";


export interface RendererConfig {
    zeroDot: boolean;
    lineWidth: number;
    antiAliasing: boolean;
    cursorMode: boolean;
    drawLookDirection: boolean;
    drawZeroLine: boolean;
}

export const RendererConfigDefault: RendererConfig = {
    zeroDot: true,
    lineWidth: 3,
    antiAliasing: false,
    cursorMode: false,
    drawLookDirection: false,
    drawZeroLine: false
}

/**
 * Class som tar seg av tegning
 */
export class Renderer {
    public config = RendererConfigDefault;
    private ctx: CanvasRenderingContext2D;
    public camera: Camera;

    constructor(private canvas: Canvas){
        this.ctx = canvas.ctx;
        this.camera = new Camera(0,0, canvas);
    }

    public render(entities: GameObject[]){
        entities.forEach((s, i) => {
            if (s.isExtentionOf(Sprite)){
                this.drawSprite(<Sprite>s);
            }
        });
        if (this.config.zeroDot) this.drawZeroDot();
        if (this.config.drawZeroLine) this.drawZeroLine();
    }

    /**
     * 
     * @param sprite Et objekt som er arver fra Sprite-klassen
     */
    private drawSprite(sprite: InstanceType<typeof Sprite>): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(sprite.x + this.camera.x, sprite.y + this.camera.y);
        this.ctx.drawImage(
            /* bilder tegnes fra øverste venstre hjørne,
            // så man må translere halvparten av bredden og
             høyden tilbake */
            sprite.sprite,
            -0.5 * sprite.width,
            -0.5 * sprite.height,
            sprite.width,
            sprite.height
        );
        this.ctx.restore();
        this.ctx.closePath();
        //debug
        if (this.config.drawLookDirection && sprite instanceof Player) {                      
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.translate(sprite.x + this.camera.x, sprite.y + this.camera.y);
            this.ctx.lineWidth = 3;
            this.ctx.fillStyle = '#000';
            this.ctx.moveTo(0,0) 
            this.ctx.lineTo(50*Math.cos(sprite.angle), 50*Math.sin(sprite.angle))
            this.ctx.stroke();
            this.ctx.restore();
            this.ctx.closePath();
        }
    }

    /**
     * 
     * @param target Datter-klasse av Sprite-klassen
     * 
     * privat method som sjekker om målet burde tegnes
     */
    private isInView(target: InstanceType<typeof Sprite>): boolean {
        return true;
    }

    private drawZeroLine(): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(0, 0 + this.camera.y);
        this.ctx.fillRect(0,0,this.canvas.width, 5);
        this.ctx.restore();
        this.ctx.closePath();
    }

    private drawZeroDot(): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(0 + this.camera.x, 0 + this.camera.y);
        this.ctx.arc(0, 0, 25, 0, 2*Math.PI);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFF';
        const text = '(0,0)';
        const textOffset = this.ctx.measureText(text);
        this.ctx.fillText(text, 0 - 0.5 * textOffset.width, 0);
        this.ctx.fillStyle = '#000';
        this.ctx.restore();
        this.ctx.closePath();
    }
}
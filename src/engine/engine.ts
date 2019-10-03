import { Canvas } from "./canvas";
import { Camera } from "./camera";
import { Sprite } from "../assets/core";



export class GameEngine {

    /**
     * liste som inneholder alle frie objekter, altså som kan beveges
     */
    entityList: Array<any>;
    /**
     * tick som brukes til forskjellige ting, som f.eks aminasjoner
     */
    public tick: number = 0;
    /**
     * array som inneholder alt som kan tegnes
     */
    public sprites: InstanceType<typeof Sprite>[] = [];

    /**
     * peker til kameraet som engine bruker
     */
    public camera: Camera;
    constructor(private canvas: Canvas) {
        // lag kamera
        this.camera = new Camera(0, 0, canvas);
        // gjør klar canvas
        canvas.resizeCanvas();
        canvas.clear();
        window.onresize  = (event: UIEvent) => {
            // må ta hensyn til at objektet "forsvinner" når nettleseren
            // skal tegne en ny frame
            if (event.eventPhase === 2) canvas.resizeCanvas();
        }
    }

    /**
     * Snarvei til canvas Context
     * 
     */
    get ctx(): CanvasRenderingContext2D {
        return this.canvas.ctx;
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
    }

    drawZeroDot(): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(0 + this.camera.x, 0 + this.camera.y);
        this.ctx.lineWidth = 5;
        this.ctx.arc(0, 0, 25, 0, 2*Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
        this.ctx.closePath();
    }

    public drawFrame(): void {
        this.canvas.clear();
        this.sprites.forEach((sprite, index) => {
            this.drawSprite(sprite)
        })
        // testing-formål
        this.drawZeroDot();
    }

}
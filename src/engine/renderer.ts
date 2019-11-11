import { Canvas } from "./canvas";
import { Sprite, GameObject } from "../assets/entities/core";
import { Camera } from "./camera";
import { Player } from "../assets/entities/player/player";
import { Level } from "../assets/levels/level";
import { Biome } from "../assets/levels/biomes/biome";
import { Block, BLOCKS } from "../utility/level.loader";
import { BLOCKSIZE } from "./engine";
import { Projectile } from "../assets/weapons/core";


export interface RendererConfig {
    zeroDot: boolean;
    lineWidth: number;
    antiAliasing: boolean;
    cursorMode: boolean;
    drawLookDirection: boolean;
    drawZeroLine: boolean;
    showFps: boolean;
    drawWireframe: boolean;
}

export const RendererConfigDefault: RendererConfig = {
    zeroDot: true,
    lineWidth: 3,
    antiAliasing: false,
    cursorMode: false,
    drawLookDirection: false,
    drawZeroLine: false,
    showFps: true,
    drawWireframe: false
}

/**
 * Class som tar seg av tegning
 */
export class Renderer {
    // config
    public config = RendererConfigDefault;
    // referanse som gjør at vi faktisk kan tegne
    private ctx: CanvasRenderingContext2D;
    // referanse til kamera
    public camera: Camera;

    // kun til å regne ut fps
    public fps: number = 0;
    private timings: number[] = [];

    constructor(private canvas: Canvas){
        this.ctx = canvas.ctx;
        this.camera = new Camera(0,0, canvas);
    }

    //borders med relativ posisjon i henhold til camera-posisjon
    private get borderLeft(): number {
        return -this.camera.x;
        // return this.camera.x - 0.5 * this.canvas.width;
    }
    private get borderRight(): number {
        return -this.camera.x + this.canvas.width;
    }
    private get borderTop(): number {
        return -this.camera.y ;
    }
    private get borderBottom(): number {
        return -this.camera.y + this.canvas.height;
    }

    private checkIfEntityInView(target: Sprite): boolean {
        if (target instanceof Sprite){            
            if (
                target.right < this.borderLeft ||
                target.left > this.borderRight ||
                target.top < this.borderTop ||
                target.bottom > this.borderBottom + target.height
            ) {
                return false;
            }
        }
        return true;
    }

    private checkIfBlockInView(x: number, y: number): boolean {
        if (
            BLOCKSIZE * (x + 0.5) < this.borderLeft ||
            BLOCKSIZE * (x - 0.5) > this.borderRight ||
            BLOCKSIZE * (y + 0.5) < this.borderTop ||
            BLOCKSIZE * (y - 0.5) > this.borderBottom
        ){
            return false;
        }
        return true;
    }

    public renderEntities(entities: GameObject[]){
        entities.forEach((s, i) => {                        
            if (s instanceof Sprite){
                if (this.checkIfEntityInView(<Sprite>s)) {
                    this.drawSprite(<Sprite>s);                    
                }
            }
        });        
        if (this.config.zeroDot) this.drawZeroDot();
        if (this.config.drawZeroLine) this.drawZeroLine();
        if (this.config.showFps) this.showFps();
    }

    public renderProjectiles(proj: Projectile[]){
        for (let i = 0; i < proj.length; i++){
            if (this.checkIfEntityInView(<Sprite>proj[i])) {
                this.drawProjectile(proj[i])
            } else {
                proj.splice(i, 1);
                i--;
            }
        }
    }

    public renderLevel(level: Level){
        level.forEach((biome: Biome, biomeIndex: number) => {
            this.drawBiome(biome);
        })
    }

    private drawBiome(biome: Biome){
        biome.data.forEach((_v, yindex) => {
            _v.forEach((v, xindex) => {
               if (this.checkIfBlockInView(xindex, yindex)){
                   this.drawBlock(BLOCKS[v], xindex, yindex);
               }
            })
        })
    }

    public drawBlock(block: Block, xindex: number, yindex: number){
        if (block.defaultColor !== ''){
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.translate(xindex * BLOCKSIZE + this.camera.x - (0.5 * BLOCKSIZE), yindex * BLOCKSIZE + this.camera.y - (0.5 * BLOCKSIZE));
            //midlertidig løsning, få til endring av farge senere
            this.ctx.fillStyle = block.defaultColor;
            this.ctx.fillRect(0, 0, BLOCKSIZE, BLOCKSIZE);
            this.ctx.restore();
            this.ctx.closePath();
        }
        if (this.config.drawWireframe) {
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.translate(xindex * BLOCKSIZE + this.camera.x - (0.5 * BLOCKSIZE), yindex * BLOCKSIZE + this.camera.y - (0.5 * BLOCKSIZE));
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(BLOCKSIZE, 0);
            this.ctx.lineTo(BLOCKSIZE, BLOCKSIZE);
            this.ctx.lineTo(0, BLOCKSIZE);
            this.ctx.lineTo(0, 0);
            this.ctx.strokeStyle = '#F00';
            this.ctx.stroke();
            this.ctx.restore();
            this.ctx.closePath();
        }
    }

    private drawProjectile(sprite: InstanceType<typeof Projectile>): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(sprite.x + this.camera.x , sprite.y + this.camera.y );
        this.ctx.rotate(sprite.angle);
        this.ctx.drawImage(
            /* bilder tegnes fra øverste venstre hjørne,
               så man må translere halvparten av bredden og
               høyden tilbake */
            sprite.sprite,
            - (0.5 * sprite.width),
            - (0.5 * sprite.height),
            sprite.width,
            sprite.height
        );
        this.ctx.restore();
        this.ctx.closePath();
    }

    /**
     * 
     * @param sprite Et objekt som er arver fra Sprite-klassen
     */
    private drawSprite(sprite: InstanceType<typeof Sprite>): void {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(sprite.x + this.camera.x - (0.5 * sprite.width), sprite.y + this.camera.y - (0.5 * sprite.height));
        this.ctx.drawImage(
            /* bilder tegnes fra øverste venstre hjørne,
               så man må translere halvparten av bredden og
               høyden tilbake */
            sprite.sprite,
            0,
            0,
            sprite.width,
            sprite.height
        );
        this.ctx.restore();
        this.ctx.closePath();
        if (this.config.drawLookDirection && sprite instanceof Player) {                      
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.translate(sprite.x + this.camera.x, sprite.y + this.camera.y);
            this.ctx.lineWidth = 3;
            this.ctx.fillStyle = '#000';
            this.ctx.moveTo(0,0);
            this.ctx.lineTo(50*Math.cos(sprite.angle), 50*Math.sin(sprite.angle));
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
    // debug funksjoner
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

    private showFps(): void {
        const now = performance.now();
        while (this.timings.length > 0 && this.timings[0] <= now - 1000) {
            this.timings.shift();
        }
        this.timings.push(now);
        this.fps = this.timings.length - 1;
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(5, 20);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(String(this.fps), 0, 0);
        this.ctx.restore();
        this.ctx.closePath();
        
    }
}
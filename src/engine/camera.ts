import { GameObject, Sprite } from "../assets/core";
import { Canvas } from "./canvas";

const ZOOM_DEFAULT = 1;

interface Point {
    x: number,
    y: number
}

/**
 * @param <number> [x] Påkrevd, startposisjon for kamera
 * @param <number> [y] Påkrevd, startposisjon for kamera
 * @param <number> [zoom] Zoom-nivå, default er 1
 */
export class Camera {
    
    private lastTarget: InstanceType<typeof GameObject>;
    private lastTick: number;
    private target: InstanceType<typeof GameObject> | Point;

    constructor(
        public x: number = 0,
        public y: number = 0,
        private canvas: Canvas,
        public zoom = ZOOM_DEFAULT,
    ){}

    /**
     * funksjon til å fokusere på ting.
     * Er instant
     * @param target Målet må arve fra GameObject
     */
    lookAt(target: InstanceType<typeof GameObject> | Point): void{
        this.target = target;
    }

    public update(): void {
        this.x = (-this.target.x) + 0.5 * this.canvas.width;
        this.y = (-this.target.y) + 0.5 * this.canvas.height;
    }

    /**
     * 
     * @param target Målet må arve fra gameobject
     * @param tick 
     * Kommende funksjon som skal, over tid, fokusere på et objekt
     */
    panTo(target: InstanceType<typeof GameObject>, tick: number): void {
        
    }



}
import { GameObject, Sprite } from "../assets/entities/core";
import { Canvas } from "./canvas";

const ZOOM_DEFAULT = 1;

export class Action {
    constructor(public startTick: number, public endTick: number, ...args: any[]){
    }
    update: Function = () => {}
}

export class Screenshake extends Action {
    constructor(startTick: number, endTick: number, public factor: number){
        super(startTick, endTick);
        super.update = (tick: number, camera: Camera) => {
            let angle = 2 * Math.PI * Math.random();
            camera.x = camera.x + this.factor * Math.cos(angle);
            camera.y = camera.y + this.factor * Math.sin(angle);
        }
    }
}



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
    
    public get WIDTH_OFFSET() { return 0.5 * this.canvas.width };
    public get HEIGHT_OFFSET() { return 0.5 * this.canvas.height }

    private lastTarget: InstanceType<typeof GameObject>;
    private target: InstanceType<typeof GameObject> | Point;
    
    private lastTick: number = 0;
    public actionList: (Action | null)[] = [];

    //faktor som tilsier hvor mye kamera skal reagere på mus-kordinat
    public mouseOffsetFactor: number = 0.2;


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

    private offsetToMouse(mouseX: number, mouseY: number){
        if (this.target){
            let angle = Math.atan2(this.HEIGHT_OFFSET - mouseY, this.WIDTH_OFFSET - mouseX);
            let length = Math.hypot(this.WIDTH_OFFSET - mouseX, this.HEIGHT_OFFSET - mouseY);
            
            this.x += this.mouseOffsetFactor * length * Math.cos(angle + Math.PI);
            this.y += this.mouseOffsetFactor * length * Math.sin(angle + Math.PI);
            

        }
    }

    public update(tick: number, mouseX: number, mouseY: number): void {
        this.x = this.target.x;
        this.y = this.target.y;
        this.offsetToMouse(mouseX, mouseY);
        this.actionList.forEach((action: Action, i: number) => {
            if (action.endTick === tick) {
                this.actionList.splice(i, 1);
            } else {
                action.update(tick, this);
            }
        })
        this.lastTick = tick;
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
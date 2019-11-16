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
    
    private lastTarget: InstanceType<typeof GameObject>;
    private target: InstanceType<typeof GameObject> | Point;
    
    private lastTick: number = 0;
    public actionList: (Action | null)[] = [];



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

    public update(tick: number): void {
        this.x = this.target.x;
        this.y = this.target.y;
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
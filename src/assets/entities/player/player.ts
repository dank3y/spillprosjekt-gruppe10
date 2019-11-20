import { NPC } from "../core";
// definer sprite-en her
const sprite = require('./sprite.png');

export let kills: number = 0;
export let score: number = 0;

/**
 * @param width valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 * @param height valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 */
export class Player extends NPC {
    // Animasjoner
    private _stand:string = require('./sprite.png');
    private _walk0:string = require('./walk0.png');
    private _walk1:string = require('./walk1.png');
    private _walk2:string = require('./walk2.png');
    private _walk3:string = require('./walk3.png');
    private _walk4:string = require('./walk4.png');
    private _walk5:string = require('./walk5.png');
    private _walk6:string = require('./walk6.png');
    private _walk7:string = require('./walk7.png');

    private walkSq:HTMLImageElement[];

    //boolean verdier som tilsier om knappene er trykket ned
    constructor(
        x: number,
        y: number,
        width?: number,
        height?: number,
        mass?: number,
        vx: number = 0,
        vy: number = 0,
        angle: number = 0,
        private stand?: HTMLImageElement,
        private walk0?: HTMLImageElement,
        private walk1?: HTMLImageElement,
        private walk2?: HTMLImageElement,
        private walk3?: HTMLImageElement,
        private walk4?: HTMLImageElement,
        private walk5?: HTMLImageElement,
        private walk6?: HTMLImageElement,
        private walk7?: HTMLImageElement
        ){
        super(x, y, sprite, width, height, mass, vx, vy, angle);
        this.d = false;
        
        this.stand = super.createSpriteImage(this._stand);
        this.walk0 = super.createSpriteImage(this._walk0);
        this.walk1 = super.createSpriteImage(this._walk1);
        this.walk2 = super.createSpriteImage(this._walk2);
        this.walk3 = super.createSpriteImage(this._walk3);
        this.walk4 = super.createSpriteImage(this._walk4);
        this.walk5 = super.createSpriteImage(this._walk5);
        this.walk6 = super.createSpriteImage(this._walk6);
        this.walk7 = super.createSpriteImage(this._walk7);
        this.walkSq = [this.walk0, this.walk1, this.walk2, this.walk3, this.walk4, this.walk5, this.walk6, this.walk7];
    }

<<<<<<< HEAD
    private KEYDOWN_EVENT_HANDLER(event: KeyboardEvent): void {                
        switch (event.key) {
            case 'w': this.w = true; break;
            case 'a': this.a = true; break;
            case 's': this.s = true; break;
            case 'd': this.d = true; break;
            case ' ': event.preventDefault(); this.w = true; break;
            case 'r': this.reload = true; break;
        }
    }

    private KEYUP_EVENT_HANDLER(event: KeyboardEvent): void {
        switch (event.key) {
            case 'w': this.w = false; break;
            case 'a': this.a = false; break;
            case 's': this.s = false; break;
            case 'd': this.d = false; break;
            case ' ': this.w = false; break;
            case 'r': this.reload = false; break;
        }
    }
=======
    
>>>>>>> 4b591596ec8744f459f2e28c0b7dcff2a3fbb53b

    public animate(): void {
        if(this.vy > 0.5 || this.vy < -0.5) {
            this.sprite = this.walk4;
            this.aniTick = 0;
        } else if(this.a || this.d) {
            if(this.aniTick > this.walkSq.length-1) this.aniTick = 0;
            this.sprite = this.walkSq[this.aniTick];
            this.aniTick++;
        } else {
            this.sprite = this.stand;
            this.aniTick = 0;
        }
    }
}
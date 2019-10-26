import { Player } from "./entities/player/player";


/**
 * Hjelpeobjekt 
 */
export class SettingsHelper {
    /**
     * Funksjon ment til å enkelt "merge" endringer og standardinnstillingner
     * @param changes Endringene som skal foretas
     * @param defaultSettings Standard innstillinger
     */
    static MergeWidthDefault(changes: object, defaultSettings: object) {
        return Object.assign(changes, defaultSettings);
    }
}
/**
 * det mest grunnleggende objektet i vårt spill.
 */
export class GameObject {
    constructor(public x: number, public y: number){}
    public logPositon(): void {
        console.log(`My position is (${this.x}, ${this.y})`);
    }


    // funksjon som PhysicsEngine bruker, ikke tenk på det
    public isExtensionOf(target: any): boolean {
        if (this.constructor === target) {
            return true;
        } else {
            let prev = this;
            while (prev.constructor != Object) {
                let next = Object.getPrototypeOf(prev);
                if (next.constructor == target) {
                    return true;
                }
                prev = next;
            }
            return false;
        }
    }
}
/**
 * Kort sagt et gameobject med et bilde. Statisk, og reagerer ikke
 * på tyngdekraft.  
 * @param x Påkrevd x-posisjon
 * @param y Påkrevd y-posisjon
 * @param _sprite påkrevd
 * @param width valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 * @param height valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 */
export class Sprite extends GameObject {
    public sprite: HTMLImageElement;

    constructor(public x: number,
                public y: number,
                _sprite: string,
                public width?: number,
                public height?: number) {
        super(x, y);
        this.sprite = this.createSpriteImage(_sprite);
        if (!width || !height) {                     
            this.width = this.sprite.naturalWidth;
            this.height = this.sprite.naturalHeight; 
        }
    }

    public get left() { return this.x - 0.5 * this.width; }
    public get right() { return this.x + 0.5 * this.width; }
    public get top() { return this.y - 0.5 * this.height; }
    public get bottom() { return this.y + 0.5 * this.height; }


    private createSpriteImage(src: string): HTMLImageElement{
        let img = new Image();
            img.src = src;        
        return img;
    }
}
/**
 * Alle ting som skal reagere på f.eks. tyngdekraft, er
 * arver fra denne class'en. De trenger derfor en "hitbox",
 * altså x, y, bredde, høyde, sprite, dx og dy
 */
export class PhysicsBody extends Sprite {
    constructor(x: number,
                y: number,
                _sprite: string,
                width?: number,
                height?: number,
                public mass: number = 80,
                public vx: number = 0,
                public vy: number = 0){
        super(x, y, _sprite, width, height);
        
    }
}

export class NPC extends PhysicsBody {
    constructor(
        x: number,
        y: number,
        _sprite: string,
        width?: number,
        height?: number,
        mass?: number,
        vx?: number,
        vy?: number,
        public _angle = 0,
    ){
        super(x, y, _sprite, width, height, mass, vx, vy);
    }

    //skal senere gjøre slik at store tall kan minskes
    get angle(): number {
        return this._angle;
    }

}
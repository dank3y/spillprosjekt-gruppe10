import { Player } from "./player/player";
import { Weapon } from "../weapons/core";


/**
 * Hjelpeobjekt 
 */
export class SettingsHelper {
    /**
     * Funksjon ment til å enkelt "merge" endringer og standardinnstillingner
     * @param changes Endringene som skal foretas
     * @param defaultSettings Standard innstillinger
     */
    static MergeWithDefault(changes: object, defaultSettings: object) {
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
    public w: boolean = false;
    public a: boolean = false;
    public d: boolean = true;
    public s: boolean = false;
    public attack: boolean = false;

    public weapons: Weapon[] = [];
    // null skal etterhvert være kniv
    public currentWeaponIndex = 0;

    get weapon() { return this.weapons[this.currentWeaponIndex] };
    
    public healthCurrent: number;
    get healthColor(): string {

        let factor = this.healthCurrent / this.healthMax;

        if (factor >= 0.00 && factor < 0.33){
            return 'rgba(245, 66, 66, 1)';
        } else if (factor >= 0.33 && factor < 0.66){
            return 'rgba(237, 100, 21, 1)';
        } else if (factor >= 0.66){
            return 'rgba(15, 219, 32, 1)';
        }
    }

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
        public speed: number = 1,
        public jumpheight: number = 12,
        public healthMax = 100
    ){
        super(x, y, _sprite, width, height, mass, vx, vy);
        // check om bredde eller høyde er delelig på blocksize
        if (
            this.width % 32 !== 0 ||
            this.height % 32 !== 0
        ) {
            throw new Error('Sprite har ikke korrekt bredde/høyde')
        }
        //initialverdi
        this.healthCurrent = this.healthMax;
    }

    //skal senere gjøre slik at store tall kan minskes
    get angle(): number {
        return this._angle;
    }

}
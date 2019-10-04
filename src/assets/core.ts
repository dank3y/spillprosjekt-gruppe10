

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
    constructor(public x: number,
                public y: number,
                _sprite: string,
                public mass: number = 80,
                width?: number,
                height?: number,
                public dx: number = 0,
                public dy: number = 0){
        super(x, y, _sprite, width, height);
        
    }
}
import { Weapon } from '../weapons/core';

/**
 * Det mest grunnleggende spillobjektet.
 */
export class GameObject {
	constructor(
		public x: number, 
		public y: number
	){}
	
	public logPosition(): void {
		console.log(`My position is (${this.x}, ${this.y})`);
	}

	/**
	 * Sjekker om et objekt er utvidet fra målet.
	 * @param target Målet
	 */
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
 * @param x Påkrevd - x-posisjon
 * @param y Påkrevd - y-posisjon
 * @param _sprite Påkrevd - bilde
 * @param width Valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 * @param height Valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 */
export class Sprite extends GameObject {
	public sprite: HTMLImageElement;

	constructor(
		public x: number,
		public y: number,
		_sprite: string,
		public width?: number,
		public height?: number
	){
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

	public createSpriteImage(src: string): HTMLImageElement{
		let img = new Image();
		img.src = src;        
		return img;
	}
}

/**
 * Alle objekter som skal reagere på spillverdenen arver fra denne klassen. 
 * De trenger derfor en "hitbox".
 * vx og vy - hastighet i x og y retning.
 */
export class PhysicsBody extends Sprite {
	constructor(
		x: number,
		y: number,
		_sprite: string,
		width?: number,
		height?: number,
		public mass: number = 80,
		public vx: number = 0,
		public vy: number = 0
	){
		super(x, y, _sprite, width, height);
	}
}

/**
 * Alle objekter som blir styrt av AI eller spilleren arver fra denne klassen.
 * anitick - brukes til animasjoner.
 */
export class NPC extends PhysicsBody {
	public w: boolean = false;
	public a: boolean = false;
	public d: boolean = true;
	public s: boolean = false;
	public attack: boolean = false;
	public aniTick: number = 0;
	public reload: boolean = false;

	public weapons: Weapon[] = [];
	public currentWeaponIndex = 0;

	get weapon() { return this.weapons[this.currentWeaponIndex] };

	public healthCurrent: number;
	get healthColor(): string {
		let factor = this.healthCurrent / this.healthMax;

		if (factor >= 0.00 && factor < 0.33) {
			return 'rgba(245, 66, 66, 1)';
		} else if (factor >= 0.33 && factor < 0.66) {
			return 'rgba(237, 100, 21, 1)';
		} else if (factor >= 0.66) {
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
		this.healthCurrent = this.healthMax;

		// Sjekk om bredde og høyde er delelig på 32.
		if (
			this.width % 32 !== 0 ||
			this.height % 32 !== 0
		) {
			throw new Error('Sprite har ikke korrekt bredde/høyde.')
		}
	}

	get angle(): number {
		return this._angle;
	}
}
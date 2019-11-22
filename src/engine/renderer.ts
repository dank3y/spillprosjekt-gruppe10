import { Canvas } from './canvas';
import { Camera } from './camera';
import { Sprite, GameObject, NPC } from '../assets/entities/core';
import { Player } from '../assets/entities/player/player';
import { Goal } from '../assets/entities/goal/goal';
import { Projectile } from '../assets/weapons/core';
import { Room } from '../assets/rooms/room';
import { Block, BLOCKS } from '../utility/level.loader';
import { BLOCKSIZE } from './engine';

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

/**
 * Standardkonfigurasjon for hvilke debug-verktøy som skal tegnes.
 */
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
	public get WIDTH_OFFSET() { return 0.5 * this.canvas.width};
	public get HEIGHT_OFFSET() { return 0.5 * this.canvas.height};
	
	// Konfigurasjon
	public config = RendererConfigDefault;

	// Referansen til Canvas som gjør at vi kan tegne.
	private ctx: CanvasRenderingContext2D;

	// Referanse til spillkameraet.
	public camera: Camera;

	// Brukes for å regne ut FPS.
	public fps: number = 0;
	private timings: number[] = [];

	/**
	 * Setter opp kameraet slik at vi kan bevege oss rundt i canvaset.
	 */
	constructor(private canvas: Canvas){
		this.ctx = canvas.ctx;
		this.camera = new Camera(0,0, canvas);
	}

	//borders med relativ posisjon i henhold til camera-posisjon
	private get borderLeft(): number { return this.camera.x - 0.5*this.canvas.width; }
	private get borderRight(): number { return this.camera.x + 0.5 * this.canvas.width; }
	private get borderTop(): number { return this.camera.y - 0.5 * this.canvas.height; }
	private get borderBottom(): number { return this.camera.y + 0.5 * this.canvas.height; }

	/**
	 * Sjekker om et spillobjekt er innenfor rekkevidden av kameraet.
	 * @param target Et spillobjekt
	 */
	private checkIfEntityInView(target: Sprite): boolean {
		if (target instanceof Sprite){            
			if (
				target.right < this.borderLeft ||
				target.left > this.borderRight ||
				target.top < this.borderTop - target.height ||
				target.bottom > this.borderBottom + target.height
			) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Sjekker om en blokk er innenfor rekkevidden av kameraet.
	 * @param x X-posisjon i grid.
	 * @param y Y-posisjon i grid.
	 */
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

	/**
	 * Tegner alle spillobjektene i canvas, så lenge de er innenfor kameraets rekkevidde.
	 * @param entities Alle spillobjekter.
	 */
	public renderEntities(entities: GameObject[]){
		entities.forEach((s, i) => {                        
			if (s instanceof Sprite){
				if (this.checkIfEntityInView(<Sprite>s)) {
					this.drawSprite(<Sprite>s);
					if ((<NPC>s) && !(s instanceof Goal)){
						this.drawHealthbar((<NPC>s))
						if ((<NPC>s).weapon){
							this.drawWeapon((<NPC>s))
						}
					}                    
				}
			}
		});        
		
		if (this.config.zeroDot) this.drawZeroDot();
		if (this.config.drawZeroLine) this.drawZeroLine();
		if (this.config.showFps) this.showFps();
	}

	/**
	 * Tegner alle prosjektiler i canvas, så lenge de er innenfor kameraets rekkevidde.
	 * @param proj Alle prosjektilene som finnes i spillverdenen.
	 */
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

	/**
	 * Tegner de individuelle blokkene i spillnivået så lenge de er
	 * innenfor kameraets rekkevidde.
	 * @param level Spillnivået.
	 */
	public renderLevel(level: Room){
		level.data.forEach((_v, yindex) => {
			_v.forEach((v, xindex) => {
				if (this.checkIfBlockInView(xindex, yindex)){
					this.drawBlock(BLOCKS[v], xindex, yindex);
				}
			});
		});
	}

	/**
	 * Tegner en "health-bar" som gjør at vi kan se % livspoeng et spillobjekt har igjen.
	 */
	private drawHealthbar(target: InstanceType<typeof NPC>): void {        
		this.ctx.beginPath();
		this.ctx.save();
		this.ctx.translate(target.x - this.camera.x + this.WIDTH_OFFSET, target.y - this.camera.y + this.HEIGHT_OFFSET);
		let factor = target.healthCurrent / target.healthMax;
		let width = 2 * target.width;
		let height = 15;
		let x = -0.5 * width;
		let y = -0.5 * target.height - height - 10;
		this.ctx.fillStyle = target.healthColor;
		this.ctx.fillRect(x, y, width * factor, height);

		let text = String(Math.floor(factor * 100)) + '%';
		this.ctx.font = '10px gamefont';
		this.ctx.fillStyle = '#000';
		this.ctx.fillText(text, -0.5 * this.ctx.measureText(text).width, y + 10.5)

		this.ctx.strokeStyle = '#000';
		this.ctx.lineWidth = 3;
		this.ctx.strokeRect(x, y, width, height);

		this.ctx.restore();
		this.ctx.closePath();
	}

	/**
	 * Tegner våpen på et bestemt target.
	 */
	private drawWeapon(target: InstanceType<typeof NPC>): void {
		this.ctx.beginPath();
		this.ctx.save();
		this.ctx.translate(
			(target.x - this.camera.x) + this.WIDTH_OFFSET + 20 * Math.cos(target.angle),
			(target.y - this.camera.y) + this.HEIGHT_OFFSET + 20 * Math.sin(target.angle)
		);
		this.ctx.rotate(target.angle);
		if (target.angle > Math.PI / 2 || target.angle < -Math.PI / 2){
			this.ctx.scale(1,-1);
		}
		this.ctx.drawImage(
			target.weapon.sprite,
			-0.5 * target.weapon.width,
			-0.5 * target.weapon.height,
			target.weapon.width,
			target.weapon.height
		);
		this.ctx.restore();
		this.ctx.closePath();
	}

	/**
	 * Tegner en blokk fra spillnivået i canvas.
	 */
	public drawBlock(block: Block, xindex: number, yindex: number){
		if (block.defaultColor !== ''){
			this.ctx.beginPath();
			this.ctx.save();
			this.ctx.translate(
				(xindex * BLOCKSIZE - this.camera.x) + this.WIDTH_OFFSET,
				(yindex * BLOCKSIZE - this.camera.y) + this.HEIGHT_OFFSET
			);
			this.ctx.fillStyle = block.defaultColor;
			this.ctx.fillRect(-(0.5 * BLOCKSIZE), -(0.5 * BLOCKSIZE), BLOCKSIZE, BLOCKSIZE);
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

	/**
	 * Tegner en enkelt prosjektil i canvas.
	 */
	private drawProjectile(sprite: InstanceType<typeof Projectile>): void {
		this.ctx.beginPath();
		this.ctx.save();
		this.ctx.translate(
			(sprite.x - this.camera.x) + this.WIDTH_OFFSET,
			(sprite.y - this.camera.y) + this.HEIGHT_OFFSET
		);
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
	* Tegner ett enkelt spillobjekt i canvas.
	* Tegnes baklengs om vinkelen er på venstre side.
	* @param sprite Et objekt som er arver fra Sprite-klassen
	*/
	private drawSprite(sprite: InstanceType<typeof Sprite>): void {
		this.ctx.beginPath();
		this.ctx.save();
		this.ctx.translate(
			(sprite.x - this.camera.x) + this.WIDTH_OFFSET,
			(sprite.y - this.camera.y) + this.HEIGHT_OFFSET
		);
		if (sprite instanceof NPC){
			if (sprite.angle > Math.PI / 2 || sprite.angle < -Math.PI / 2){
				this.ctx.scale(-1,1);
			}
		}
		this.ctx.drawImage(
			/* bilder tegnes fra øverste venstre hjørne,
			så man må translere halvparten av bredden og
			høyden tilbake */
			sprite.sprite,
			-0.5 * sprite.width,
			-0.5 * sprite.height,
			sprite.width,
			sprite.height
		);
		this.ctx.restore();
		this.ctx.closePath();
		if (this.config.drawLookDirection && sprite instanceof Player) {                      
			this.ctx.beginPath();
			this.ctx.save();
			this.ctx.translate(
				(sprite.x - this.camera.x) + this.WIDTH_OFFSET,
				(sprite.y - this.camera.y) + this.HEIGHT_OFFSET
			);
			this.ctx.lineWidth = 3;
			this.ctx.fillStyle = '#000';
			this.ctx.moveTo(0,0);
			this.ctx.lineTo(50*Math.cos(sprite.angle), 50*Math.sin(sprite.angle));
			this.ctx.stroke();
			this.ctx.restore();
			this.ctx.closePath();
		}
	}

	// Debug-funksjoner
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
		this.ctx.font = '20px gamefont';
		this.ctx.fillText(String(this.fps) + 'FPS', 0, 0);
		this.ctx.restore();
		this.ctx.closePath();
	}
}
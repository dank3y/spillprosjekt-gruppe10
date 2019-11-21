import { Canvas } from './canvas';
import { Renderer } from './renderer';
import { PhysicsEngine } from './physics-engine';
import { EnemyBehaviour } from './enemy-behaviour';
import { LevelGen } from './levelgen';
import { AudioEngine, Sounds } from './audio/audio';
import { UIEngine } from './UI/UI-engine';
import { AmmoCounter } from './UI/ammo-counter';
import { EndScreen } from './UI/end-screen';
import { Pause } from './UI/pause';
import { Hotbar } from './UI/hotbar';
import { GameOver } from './UI/game-over';
import { Screenshake } from './camera';
import { GameObject, NPC } from '../assets/entities/core';
import { Player } from '../assets/entities/player/player';
import { Enemy } from '../assets/entities/enemy/enemy';
import { Goal } from '../assets/entities/goal/goal';
import { Pistol } from '../assets/weapons/pistol/pistol';
import { SMG } from '../assets/weapons/smg/smg';
import { Shotgun } from '../assets/weapons/shotgun/shotgun';
import { Projectile } from '../assets/weapons/core';
import { Room } from '../assets/rooms/room';
import { Block } from '../utility/level.loader';

export const BLOCKSIZE: number = 32;

// Generelle spillvariabler
export let difficulty: number = 1;
export let levelCount: number = 0;
export let score: number = 0;
export let totalKills: number = 0;
export let kills: number = 0;

export class GameEngine {
	// Extensions av spillmotoren
	public renderer: Renderer;
	public physics: PhysicsEngine;
	public enemyBehaviour: EnemyBehaviour;
	public levelGen: LevelGen;
	public UIEngine: UIEngine;
	public audio: AudioEngine;

	// Game states
	public paused: boolean = false;
	public levelCleared: boolean = false;
	public gameEnded: boolean = false;

	// Holder styr på musekoordinater
	public mouseX: number = 0;
	public mouseY: number = 0;

	// Viktige spillelementer
	public level: Room;
	public player: Player;
	public goal: Goal;

	// Lister som inneholder alle spillobjekter og prosjektiler.
	public entities: InstanceType<typeof GameObject>[] = [];
	public projectiles: Projectile[] = [];
	
	// Tick som brukes til forskjellige ting, som animasjoner
	public tick: number = 0;

	constructor(private canvas: Canvas) {
		// Gjør klar canvas
		canvas.resizeCanvas();
		canvas.clear();

		// Legger inn spiller-objektet
		this.player = new Player(0, 0, 32, 64);
		this.entities.push(this.player);
		this.player.weapons.push(
			new Pistol(1,1),
			new Shotgun(0,0),
			new SMG(1,1)
		);

		// Start level-generator.
		this.levelGen = new LevelGen();
		this.newLevel();

		// Start UI engine.
		this.UIEngine = new UIEngine(canvas);
		this.UIEngine.addElements(
			new AmmoCounter(this.player),
			new Hotbar(this.player)
		);

		// Start audio engine.
		this.audio = new AudioEngine();
	
		// Start physics engine.
		this.physics = new PhysicsEngine();
		this.physics.projectileHit = (target: NPC | Block) => {
			if (target instanceof NPC){
				this.audio.hit_npc();
				if (target instanceof Player) {
					this.audio.hit_player();
				} else if (target instanceof Enemy){
					this.audio.hit_enemy();
				}
			}
			if (target instanceof Block){
				this.audio.hit_world();
			}
		}
		this.physics.onjump = () => this.audio.jump();
		this.physics.onland = () => this.audio.land();

		// Start renderer
		this.renderer = new Renderer(canvas);
		this.runRenderer();
		this.renderer.camera.lookAt(this.player);
	
		// Start AI
		this.enemyBehaviour = new EnemyBehaviour();


		// EVENT LISTENERS \\
		this.canvas.onmousemove = (ev: MouseEvent) => {
			this.mouseX = ev.offsetX;
			this.mouseY = ev.offsetY;            
		}
		
		this.canvas.onmousedown = () => {
			this.player.attack = true;
		}

		this.canvas.onmouseup = () => {
			this.player.attack = false;
		}

		window.onkeydown = (ev: KeyboardEvent) => {            
			this.KEYDOWN_EVENT_HANDLER_PLAYER(ev);
			switch (ev.key){
				case 'p':
				case 'Escape': 
					this.togglePause(); 
					break;
				case 'Enter': 
					this.resetPlayer(); 
					break;
				case ' ': 
					if(this.levelCleared) {
						this.newLevel();
						this.UIEngine.elements.splice(this.UIEngine.elements.indexOf(new EndScreen));
					} else if(this.gameEnded) {
						this.newGame();
						this.UIEngine.elements.splice(this.UIEngine.elements.indexOf(new GameOver));
					}
					break;
			}
		};
		
		window.onkeyup = (ev: KeyboardEvent) => {
			this.KEYUP_EVENT_HANDLER_PLAYER(ev)
		};

		window.onresize  = (event: UIEvent) => {
			// Vi må ta hensyn til at objektet "forsvinner" 
			// når nettleseren skal tegne en ny frame.
			if (event.eventPhase === 2) canvas.resizeCanvas();
		}
	}

	private runRenderer(): void {
		const that = this;
		that.canvas.clear();
		that.renderer.renderLevel(this.level);        
		that.renderer.renderEntities(this.entities);
		that.renderer.renderProjectiles(this.projectiles);
		that.UIEngine.renderElements();
		window.requestAnimationFrame(this.runRenderer.bind(that));
	}

	/**
	 * Hovedlogikken i spillet.
	 * Alle spillobjekter og tegnemotoren oppdateres.
	 * 
	 * Undersøker også om spilleren har vunnet nivået eller tapt spillet.
	 */
	public loop(): void{
		if (!this.paused){
			this.updateWeapons(this.entities);
			this.updateProjectiles(this.projectiles);
			this.enemyBehaviour.update(this.entities, this.level, this.player);
			
			this.physics.update(this.entities, this.level);
			this.physics.checkCollisionProjectiles(this.entities.filter(t => t instanceof NPC), this.projectiles, this.level);

			this.updatePlayerAngle();

			this.renderer.camera.update(this.tick, this.mouseX, this.mouseY);

			if(this.tick % 3 === 0) this.updateAni(this.entities);

			if(this.physics.touches(this.player, this.goal)) this.finishLevel();
			if(this.player.healthCurrent <= 0) this.gameOver();
			
			this.tick++; 
		}
	}

	/**
	 * Setter spillerens vinkel til å være vinkelen 
	 * imellom spiller og musepekeren.
	 */
	private updatePlayerAngle(): void {
		let x = (this.player.x - this.renderer.camera.x) + this.renderer.WIDTH_OFFSET;
		let y = (this.player.y - this.renderer.camera.y) + this.renderer.HEIGHT_OFFSET;

		let angle = Math.atan2(this.mouseY - y, this.mouseX - x);
		this.player._angle = angle;
	}

	/**
	 * Oppdaterer alle prosjektiler.
	 * @param entitites Array med alle prosjektiler.
	 */
	public updateProjectiles(entitites: GameObject[]): void {
		this.projectiles.forEach((p, i) => {
			p.update();
		});
	}

	/**
	 * Oppdaterer animasjonene til alle objekter som har det.
	 * @param entities Array med alle spillobjekter.
	 */
	private updateAni(entities: GameObject[]): void {
		entities.forEach(entity => {
			if(entity instanceof Player || entity instanceof Enemy) {
				entity.animate();
			}
		});
	}

	/**
	 * Kjøres når spillnivået er fullført.
	 * Regner ut poengsum og viser infoboks.
	 */
	private finishLevel(): void {
		this.paused = true;
		this.levelCleared = true;

		this.audio.playSound(Sounds.WTF);
		kills = this.player.kills;
		this.player.kills = 0;
		totalKills += kills;
		score += Math.floor(kills * difficulty * 10);
		this.UIEngine.addElements(new EndScreen());
	}

	/**
	 * Setter opp et nytt spillnivå: tilbakestiller livspoeng,
	 * lader våpen helt, øker nivåtelleren og øker vanskelighetsgraden.
	 */
	private newLevel(): void {
		this.paused = false;
		this.levelCleared = false;
		while(this.entities.length > 1) { this.entities.pop(); }
		
		this.player.healthCurrent = this.player.healthMax;
		levelCount++;
		kills = 0;
		difficulty = 1.1 ** (levelCount-1);

		this.level = this.levelGen.makeLevel();
		this.spawnEntities();
		this.goal = <Goal>this.entities[this.entities.length-1];

		this.player.weapons.forEach(weapon => {
			weapon.leftInMag = weapon.magSize
		});
		this.resetPlayer();
	}

	
	/**
	 * Kjøres når spillet er tapt.
	 */
	private gameOver(): void {
		this.paused = true;
		this.gameEnded = true;
		this.UIEngine.addElements(new GameOver);
	}

	/**
	 * Tilbakestiller spillet helt.
	 */
	private newGame(): void {
		this.gameEnded = false;
		difficulty = 1;
		levelCount = 0;
		score = 0;
		kills = 0;
		totalKills = 0;
		this.newLevel();
	}

	/**
	 * Setter inn alle spillobjekter i nivået.
	 */
	private spawnEntities():void {
		this.level.entities.forEach(entity => {
			this.entities.push(entity);
		});
	}

	/**
	 * Tilbakestiller spilleren til startposisjonen.
	 */
	private resetPlayer(): void {
		this.player.x = 128;
		this.player.y = 800;
		this.player.vx = 0;
		this.player.vy = 0;
	}

	/**
	 * Setter spillet på pause.
	 */
	private togglePause(): void{        
		this.paused = !this.paused;
		if (this.paused){
			this.UIEngine.addElements(new Pause());
		} else {
			this.UIEngine.elements.splice(this.UIEngine.elements.indexOf(new Pause))
		}
	}

	private KEYDOWN_EVENT_HANDLER_PLAYER(event: KeyboardEvent): void {
		switch (event.key) {
			case 'w': this.player.w = true; break;
			case 'a': this.player.a = true; break;
			case 's': this.player.s = true; break;
			case 'd': this.player.d = true; break;
			case ' ': this.player.w = true; event.preventDefault(); break;
			case 'r': this.player.reload = true; break;
			//hotbar
			case '1': this.player.currentWeaponIndex = 0; break;
			case '2': this.player.currentWeaponIndex = 1; break;
			case '3': this.player.currentWeaponIndex = 2; break;
		}
	}

	private KEYUP_EVENT_HANDLER_PLAYER(event: KeyboardEvent): void {
		switch (event.key) {
			case 'w': this.player.w = false; break;
			case 'a': this.player.a = false; break;
			case 's': this.player.s = false; break;
			case 'd': this.player.d = false; break;
			case ' ': this.player.w = false; break;
			case 'r': this.player.reload = false; break;
		}
	}

	public updateWeapons(entitites: InstanceType<typeof GameObject>[]): void {
		entitites.forEach(e => {
			if (e instanceof NPC){
				if (e.weapon){
					const time = Date.now();
					if (time - e.weapon.reloadStart > e.weapon.reloadTime * 1000){
						if (e.weapon.reloading){
							e.weapon.reloading = false;
							if (e.weapon instanceof Shotgun && e.weapon.leftInMag < e.weapon.magSize){
								e.weapon.leftInMag++;
								e.weapon.reloading = true;
								e.weapon.reloadStart = time;
								this.audio.playSound(Sounds.SHOT_RELOAD)
							} else {
								if (e.weapon.leftInMag > 0) {
									e.weapon.leftInMag = e.weapon.magSize + 1;
								} else {
									e.weapon.leftInMag = e.weapon.magSize;
								}
							}
						}
						if (e.reload && !e.weapon.reloading){
							e.weapon.reloadStart = time;
							e.weapon.reloading = true;
							if (e.weapon instanceof Pistol) this.audio.playSound(Sounds.GUN_RELOAD);
							if (e.weapon instanceof SMG) this.audio.playSound(Sounds.SUB_RELOAD);
							if (e.weapon instanceof Shotgun) this.audio.playSound(Sounds.SHOT_RELOAD);
						}
					}

					if (e.attack){
						if (time - e.weapon.lastBullet > e.weapon.RPMms){               
							if (e.weapon.leftInMag){
								e.weapon.reloading = false;                               
								e.weapon.shoot(this.projectiles, e);
								e.weapon.lastBullet = time;
								if(e instanceof Player) this.renderer.camera.actionList.push(new Screenshake(this.tick, this.tick + 3, e.weapon.recoil));
								this.physics.applyForce(e, e.weapon.recoil / 2, e.angle + Math.PI)
								if (e.weapon.leftInMag > 0){
									e.weapon.leftInMag--;
								}
								this.audio.shoot(e.weapon);
							} else {
								this.audio.playSound(Sounds.TOM_KLIKK)
								e.weapon.lastBullet = time;
							}
						} 
					} 
				}
			}
		});
	}
}
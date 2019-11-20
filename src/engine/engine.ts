import { Canvas } from "./canvas";
import { Sprite, GameObject, NPC } from "../assets/entities/core";
import { Renderer } from "./renderer";
import { PhysicsEngine } from './physics-engine';
import { Room } from "../assets/rooms/room";
import { Player } from "../assets/entities/player/player";
import { EnemyBehaviour } from "./enemy-behaviour";
import { Projectile } from "../assets/weapons/core";
import { Screenshake } from "./camera";
import { Shotgun } from '../assets/weapons/shotgun/shotgun';
import { LevelGen } from "./levelgen";
import { UIEngine } from "./UI/UI-engine";
import { AmmoCounter } from "./UI/ammo-counter";
import { EndScreen } from "./UI/end-screen";
import { Pause } from "./UI/pause";
import { Hotbar } from "./UI/hotbar";
import { Pistol } from "../assets/weapons/pistol/pistol";
import { SMG } from "../assets/weapons/smg/smg";
import { Enemy } from "../assets/entities/enemy/enemy";


export const BLOCKSIZE: number = 32;
export let difficulty: number = 1;
export let levelCount: number = 0;
export let score: number = 0;
export let kills: number = 0;

export class GameEngine {

    public level: Room;

    public paused: boolean = false;
    public levelCleared: boolean = false;

    //holde styr på muskordinater
    public mouseX: number = 0;
    public mouseY: number = 0;

    public player: Player;

    public renderer: Renderer;
    public physics: PhysicsEngine;
    public enemyBehaviour: EnemyBehaviour;
    public levelGen: LevelGen;
    public UIEngine: UIEngine;

    /**
     * liste som inneholder alle objekter i spillet
     */
    entities: InstanceType<typeof GameObject>[] = [];
    /**
     * tick som brukes til forskjellige ting, som f.eks animasjoner
     */
    public projectiles: Projectile[] = [];
    
    public tick: number = 0;

    constructor(private canvas: Canvas) {
        
        // gjør klar canvas
        canvas.resizeCanvas();
        canvas.clear();

        // spawner inn spiller
        this.player = new Player(0, 0, 32, 64);
        this.entities.push(this.player);
        this.player.weapons.push(
            new Pistol(1,1),
            new Shotgun(0,0),
            new SMG(1,1)
        );

        // starter level-generator og setter opp level.
        this.levelGen = new LevelGen();
        this.newLevel();

        // start UIEngine
        this.UIEngine = new UIEngine(canvas);
        this.UIEngine.addElements(
            new AmmoCounter(this.player),
            new Hotbar(this.player) 
        )

        // start physics-engine
        this.physics = new PhysicsEngine();
        // start renderer
        this.renderer = new Renderer(canvas);
        this.runRenderer();
        // Start enemy-engine
        this.enemyBehaviour = new EnemyBehaviour();
        // // legg til spiller

        this.renderer.camera.lookAt(this.player);

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

        // legg til key-events
        window.onkeydown = (ev: KeyboardEvent) => {            
            this.KEYDOWN_EVENT_HANDLER_PLAYER(ev)
            switch (ev.key){
                case 'p':
                case 'Escape': this.togglePause(); break;
                case ' ': 
                    if(this.levelCleared) {
                        this.levelCleared = false;
                        this.newLevel();
                        this.paused = false;
                        this.UIEngine.elements.splice(this.UIEngine.elements.indexOf(new EndScreen));
                    }
            }
        };
        window.onkeyup = (ev: KeyboardEvent) => {
            this.KEYUP_EVENT_HANDLER_PLAYER(ev)
        };

        window.onresize  = (event: UIEvent) => {
            // må ta hensyn til at objektet "forsvinner" når nettleseren
            // skal tegne en ny frame
            if (event.eventPhase === 2) canvas.resizeCanvas();
        }
    }

    private runRenderer(): void {
        // tegn
        const that = this;
        that.canvas.clear();
        that.renderer.renderLevel(this.level);        
        that.renderer.renderEntities(this.entities);
        that.renderer.renderProjectiles(this.projectiles);
        that.UIEngine.renderElements();
        window.requestAnimationFrame(this.runRenderer.bind(that));
    }
    
    public loop(): void{
        // gjør utregninger
        if (!this.paused){
            this.updatePlayerAngle();
            this.physics.update(this.entities, this.level);
            this.enemyBehaviour.update(this.entities, this.level, this.player);
            this.updateWeapons(this.entities);
            this.updateProjectiles(this.projectiles)
            this.renderer.camera.update(this.tick, this.mouseX, this.mouseY);
            this.tick++;       
            if(this.touches(this.player, this.entities[this.entities.length-1])) {
                this.paused = true;
                this.levelCleared = true;
                score += Math.floor(kills * difficulty * 10);
                this.UIEngine.addElements(new EndScreen());
            }
            if(this.tick % 3 === 0) this.updateAni(this.entities);
        }
    }

    private updatePlayerAngle(){
        let x = (this.player.x - this.renderer.camera.x) + this.renderer.WIDTH_OFFSET;
        let y = (this.player.y - this.renderer.camera.y) + this.renderer.HEIGHT_OFFSET;
        
        let angle = Math.atan2(this.mouseY - y, this.mouseX - x);
        this.player._angle = angle;
    }

    private touches(object1: GameObject, object2: GameObject): boolean {
        if(!(object1 instanceof Sprite) || !(object2 instanceof Sprite)) return;

        if(object1.right > object2.left && object1.left < object2.right) {
            if(object1.top < object2.bottom && object1.bottom > object2.top) {
                return true;
            }
        }
        return false;
    }

    public updateProjectiles(entitites: GameObject[]): void {
        this.projectiles.forEach((p, i) => {
            p.update();
        })
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
                        }
                    }
                    
                    if (e.attack && e.weapon.leftInMag){                    
                        e.weapon.reloading = false;                               
                        if (time - e.weapon.lastBullet > e.weapon.RPMms){
                            e.weapon.shoot(this.projectiles, e);
                            e.weapon.lastBullet = time;
                            if(e instanceof Player) this.renderer.camera.actionList.push(new Screenshake(this.tick, this.tick + 3, e.weapon.recoil));
                            this.physics.applyForce(e, e.weapon.recoil / 2, e.angle + Math.PI)
                            if (e.weapon.leftInMag > 0){
                                e.weapon.leftInMag--;
                            }
                        }
                        
                    }
                }
            }
        })
    }

    private newLevel(): void {
        while(this.entities.length > 1) { this.entities.pop(); }
        levelCount++;
        difficulty = 1.1 ** (levelCount-1);
        this.level = this.levelGen.makeLevel();
        this.spawnEntities();
        this.player.x = 128;
        this.player.y = 800;
    }

    private spawnEntities():void {
        this.level.entities.forEach(entity => {
            this.entities.push(entity);
        });
    }

    private updateAni(entities: GameObject[]): void {
        entities.forEach(entity => {
            if(entity instanceof Player || entity instanceof Enemy) {
                entity.animate();
            }
        });
    }

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

}
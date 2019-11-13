import { Canvas } from "./canvas";
import { Sprite, GameObject } from "../assets/entities/core";
import { Renderer } from "./renderer";
import { PhysicsEngine } from './physics-engine';
import { Room } from "../assets/rooms/room";
import { Player } from "../assets/entities/player/player";
import { EnemyBehaviour } from "./enemy-behaviour";
import { LevelGen } from "./levelgen";


export const BLOCKSIZE: number = 32;


export class GameEngine {

    public level: Room;

    //holde styr på muskordinater
    public mouseX: number = 0;
    public mouseY: number = 0;

    public player: Player;

    public renderer: Renderer;
    public physics: PhysicsEngine;
    public enemyBehaviour: EnemyBehaviour;
    public levelGen: LevelGen;
    /**
     * liste som inneholder alle objekter i spillet
     */
    entities: InstanceType<typeof GameObject>[] = [];
    /**
     * tick som brukes til forskjellige ting, som f.eks animasjoner
     */
    public tick: number = 0;

    constructor(private canvas: Canvas) {
        
        // gjør klar canvas
        canvas.resizeCanvas();
        canvas.clear();

        // spawner inn spiller
        this.player = new Player(0, 0, 32, 64);
        this.entities.push(this.player);

        // starter level-generator og setter opp level.
        this.levelGen = new LevelGen();
        this.newLevel();

        // start physics-engine
        this.physics = new PhysicsEngine();
        // start renderer
        this.renderer = new Renderer(canvas);
        this.runRenderer();
        // Start enemy-engine
        this.enemyBehaviour = new EnemyBehaviour();

        this.renderer.camera.lookAt(this.player);

        this.canvas.onmousemove = (ev: MouseEvent) => {
            this.mouseX = ev.offsetX;
            this.mouseY = ev.offsetY;            
        }

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
        window.requestAnimationFrame(this.runRenderer.bind(that));
    }
    
    public loop(): void{
        // gjør utregninger
        this.updatePlayerAngle();
        this.physics.update(this.entities, this.level);
        this.enemyBehaviour.update(this.entities, this.level, this.player);
        this.renderer.camera.update();
        
        if(this.touches(this.player, this.entities[this.entities.length-1])) {
            this.newLevel();
        }
    }

    private updatePlayerAngle(){
        let x = this.player.x + this.renderer.camera.x;
        let y = this.player.y + this.renderer.camera.y;
        
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

    private newLevel(): void {
        while(this.entities.length > 1) { this.entities.pop(); }
        this.level = this.levelGen.makeLevel();
        this.spawnEntities();
        this.player.x = 128;
        this.player.y = 448;
    }

    private spawnEntities():void {
        this.level.entities.forEach(entity => {
            this.entities.push(entity);
        });
    }
}
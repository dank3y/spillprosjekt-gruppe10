import { Canvas } from "./canvas";
import { Sprite, GameObject, PhysicsBody } from "../assets/core";
import { Renderer } from "./renderer";
import { PhysicsEngine } from './physics-engine';
import { Biome, BiomeList } from "../assets/levels/biomes/biome";


export const BLOCKSIZE: number = 32;


export class GameEngine {

    level: Biome[] = [];

    //holde styr på muskordinater
    public mouseX: number = 0;
    public mouseY: number = 0;

    public renderer: Renderer;
    public physics: PhysicsEngine;
    /**
     * liste som inneholder alle objekter i spillet
     */
    entities: InstanceType<typeof GameObject>[] = [];
    /**
     * tick som brukes til forskjellige ting, som f.eks aminasjoner
     */
    public tick: number = 0;

    constructor(private canvas: Canvas) {
        
        // gjør klar canvas
        canvas.resizeCanvas();
        canvas.clear();
        // start physics-engine
        this.physics = new PhysicsEngine();
        // start renderer
        this.renderer = new Renderer(canvas);
        this.runRenderer();
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
        this.physics.update(this.entities)
        this.renderer.camera.update();
    }

    // legg til 
    public addBiome(biome: Biome, side: 'left' | 'right'){
        // vurder om biomen skal legges til på venstre eller høyre side
        if (side === 'left'){
            this.level.unshift(biome);
        } else {
            this.level.push(biome);
        }
    }

}
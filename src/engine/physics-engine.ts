import { PhysicsBody, GameObject, NPC } from "../assets/core";
import { Player } from "../assets/entities/player/player";
import { Dummy } from "../assets/entities/dummy/dummy";
import { Biome } from "../assets/levels/biomes/biome";
import { BLOCKSIZE } from "./engine";
import { Block, BLOCKS } from "../utility/level.loader";

/**
 * skal håndtere tyngdekraft osv
 */
export class PhysicsEngine {
    constructor(){}

    public g = 9.81;

    update(entities: GameObject[], currentBiome: Biome): void{        
        entities.forEach((entity, index) => {
            //særtilfelle for spiller               
            if (entity.isExtentionOf(Player)) this.updatePlayer(<Player>entity);
            //alle ting som reagerer på tyngdekraft
            if (entity.isExtentionOf(PhysicsBody)){
                // this.applyGraviy(<PhysicsBody>entity);
                this.updatePhysicsBody(<PhysicsBody>entity, currentBiome);
            } 
            
        })
    }

    private updatePhysicsBody(target: PhysicsBody, currentBiome: Biome): void {
        target.x += target.vx;
        target.y += target.vy;
        // tyngdekraft        
        this.applyGraviy(target);

        this.checkGridCollision(target, currentBiome);
    }

    private checkGridCollision(target: PhysicsBody, currentBiome: Biome){
        const biome = currentBiome.data;
        // få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        console.log(gridX, target.x);
        
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);
        let top, topBlock, right, rightBlock, bottom, bottomBlock, left, leftBlock, middleBlock;
        // sjekk om blokken er solid og få posisjon
        // middle
        if (biome[gridY] && biome[gridY][gridX]){
            middleBlock = BLOCKS[biome[gridY][gridX]];
        }
        // top
        if (biome[gridY - 1] && biome[gridY - 1][gridX]){
            top = BLOCKSIZE * (gridY - 1 + 0.5);
            topBlock = BLOCKS[biome[gridY - 1][gridX]];
        }
        // right
        if (biome[gridY] && biome[gridY][gridX + 1]) {
            right = BLOCKSIZE * (gridX + 1 - 0.5);
            rightBlock = BLOCKS[biome[gridY][gridX + 1]];
        }
        // bottom
        if (biome[gridY + 1] && biome[gridY + 1][gridX]) {
            bottom = BLOCKSIZE * (gridY + 1 - 0.5);
            bottomBlock = BLOCKS[biome[gridY + 1][gridX]];
            // console.log(target.bottom, bottom);
        }
        // left
        if (biome[gridY] && biome[gridY][gridX - 1]) {
            left = BLOCKSIZE * (gridX - 1 + 0.5);
            leftBlock = BLOCKS[biome[gridY][gridX - 1]];
        }
        //friksjon fra luft
        if (middleBlock){            
            if (!middleBlock.solid){
                if (middleBlock.friction){
                    if (target.vx > 0.05){
                        target.vx -= middleBlock.friction;
                    } else if (target.vx < -0.05) {
                        target.vx += middleBlock.friction
                    } else {
                        target.vx = 0;
                    }
                }
            }
        }
        //sjekk underlag
        if (bottom && (target.bottom >= bottom)){
            if (bottomBlock.solid){
                target.vy = 0;
                target.y  = bottom - 0.5 * target.height;                
            }
        }
        //spesialtilfelle hvis spilleren har ekstrem hastighet skal legges til


    }

    private applyGraviy(target: PhysicsBody): void {
        // legg til tyngdekraft over 60 frames (1 sekund)
        target.vy += target.mass * this.g / 1000; 
    }

    public applyForce(target: PhysicsBody, factor: number, angle: number): void {
        target.vx += factor * Math.cos(angle);
        target.vy += factor * Math.sin(angle);
    }

    private updatePlayer(player: Player): void{
        // midlertidig
        const step = 1;
        if (player.w && player.vy === 0) this.applyForce(player, 12, -Math.PI/2);
        // if (player.w) player.y -= step;
        if (player.a) this.applyForce(player, 1.5, -Math.PI);
        // if (player.s) player.y += step;
        if (player.d) this.applyForce(player, 1.5, 0);
    }

}


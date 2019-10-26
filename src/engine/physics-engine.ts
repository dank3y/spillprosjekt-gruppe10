import { PhysicsBody, GameObject, NPC } from "../assets/core";
import { Player } from "../assets/entities/player/player";
import { Dummy } from "../assets/entities/dummy/dummy";
import { Biome } from "../assets/levels/biomes/biome";
import { BLOCKSIZE } from "./engine";
import { Block, BLOCKS } from "../utility/level.loader";

/**
 * Skal håndtere tyngdekraft osv
 */
export class PhysicsEngine {
    constructor(){}

    public g = 9.81;

    update(entities: GameObject[], currentBiome: Biome): void{        
        entities.forEach((entity, index) => {
            //særtilfelle for spiller               
            if (entity.isExtensionOf(Player)) this.updatePlayer(<Player>entity);
            //alle ting som reagerer på tyngdekraft
            if (entity.isExtensionOf(PhysicsBody)){
                // this.applyGraviy(<PhysicsBody>entity);
                this.updatePhysicsBody(<PhysicsBody>entity, currentBiome);
            } 
            
        })
    }

    private updatePhysicsBody(target: PhysicsBody, currentBiome: Biome): void {
        target.x += target.vx;
        target.y += target.vy;

        // Limit entity speed
        if(target.vx > 12) {
            target.vx = 12;
        }
        if(target.vx < -12) {
            target.vx = -12;
        }
        if(target.vy > 16) {
            target.vy = 16;
        }
        if(target.vy < -16) {
            target.vy = -16;
        }
        
        this.applyGravity(target);
        this.checkGridCollision(target, currentBiome);
    }

    private checkGridCollision(target: PhysicsBody, currentBiome: Biome){
        const biome = currentBiome.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);
        
        // Hent blocks rundt target
        let targetBlock, bottomBlock, topBlock, leftBlock, rightBlock;
        let bottom, top, left, right;

        // TARGET
        if (biome[gridY] && biome[gridY][gridX]){
            targetBlock = BLOCKS[biome[gridY][gridX]];
        }

        // BOTTOM
        if (biome[gridY + 1] && biome[gridY + 1][gridX]) {
            bottom = BLOCKSIZE * (gridY + 1 - 0.5);
            bottomBlock = BLOCKS[biome[gridY + 1][gridX]];
        }

        // TOP
        if (biome[gridY - 1] && biome[gridY - 1][gridX]){
            top = BLOCKSIZE * (gridY - 1 + 0.5);
            topBlock = BLOCKS[biome[gridY - 1][gridX]];
        }

        // LEFT
        if (biome[gridY] && biome[gridY][gridX - 1]) {
            left = BLOCKSIZE * (gridX - 1 + 0.5);
            leftBlock = BLOCKS[biome[gridY][gridX - 1]];
        }

        // RIGHT
        if (biome[gridY] && biome[gridY][gridX + 1]) {
            right = BLOCKSIZE * (gridX + 1 - 0.5);
            rightBlock = BLOCKS[biome[gridY][gridX + 1]];
        }
        
        // COLLISION DETECTION
        // AIR FRICTION
        if (targetBlock){            
            if (!targetBlock.solid){
                if (targetBlock.friction){
                    if (target.vx > 0.05){
                        target.vx -= targetBlock.friction;
                    } else if (target.vx < -0.05) {
                        target.vx += targetBlock.friction
                    } else {
                        target.vx = 0;
                    }
                }
            }
        }

        // BOTTOM
        if (bottom && (target.bottom >= bottom)){
            if (bottomBlock.solid){
                target.vy = 0;
                target.y  = bottom - 0.5 * target.height;                
            }
        }

        // TOP
        if (top && (target.top <= top)) {
            if(topBlock.solid) {
                target.vy = 0.1;
                target.y = top + 0.5 * target.height;
            }
        }

        // LEFT
        if (left && (target.left <= left)) {
            if(leftBlock.solid) {
                target.vx = 0;
                target.x = left + 0.5 * target.width;
            }
        }

        // RIGHT
        if (right && (target.right >= right)) {
            if(rightBlock.solid) {
                target.vx = 0;
                target.x = right - 0.5 * target.width;
            }
        }
    }

    private applyGravity(target: PhysicsBody): void {
        // Legg til tyngdekraft over 60 frames (1 sekund)
        target.vy += target.mass * this.g / 1000; 
    }

    public applyForce(target: PhysicsBody, factor: number, angle: number): void {
        target.vx += factor * Math.cos(angle);
        target.vy -= factor * Math.sin(angle);
    }

    private updatePlayer(player: Player): void{
        // Midlertidig
        const step = 1;
        if (player.w && player.vy === 0) this.applyForce(player, 12, Math.PI/2);
        // if (player.w) player.y -= step;
        if (player.a) this.applyForce(player, 1.5, -Math.PI);
        // if (player.s) player.y += step;
        if (player.d) this.applyForce(player, 1.5, 0);
    }

}


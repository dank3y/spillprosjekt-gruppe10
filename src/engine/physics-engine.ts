import { PhysicsBody, GameObject, NPC } from "../assets/entities/core";
import { Player } from "../assets/entities/player/player";
import { Room } from "../assets/rooms/room";
import { BLOCKSIZE } from "./engine";
import { BLOCKS, Block } from "../utility/level.loader";
import { Projectile } from "../assets/weapons/core";

const THRESHOLD_ACCURATE_PROJECTILE_MODE = 64;

/**
 * Skal håndtere tyngdekraft osv
 */
export class PhysicsEngine {
    constructor(){}

    public g = 9.81;

    public noclip: boolean = false;


    update(entities: GameObject[], gameLevel: Room): void{        
        entities.forEach((entity, index) => {
            //særtilfelle for spiller               
            if (entity.isExtensionOf(Player)) this.updatePlayer(<Player>entity);
            // Beveg NPCer
            if(entity instanceof NPC && !(entity instanceof Player)) {
                this.updateNPC(entity);
                //sjekk om de er døde
                if (entity.healthCurrent <= 0) {
                    entities.splice(index, 1); 
                    this.increaseKills(entities);
                }
            }
            //alle ting som reagerer på tyngdekraft
            if (entity.isExtensionOf(PhysicsBody)){
                // this.applyGraviy(<PhysicsBody>entity);
                this.updatePhysicsBody(<PhysicsBody>entity, gameLevel);
            } 
        })
    }

    private updatePhysicsBody(target: PhysicsBody, gameLevel: Room): void {
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
        this.checkGridCollision(target, gameLevel);
    }

    private checkGridCollision(target: PhysicsBody, gameLevel: Room){
        if (this.noclip && target instanceof Player) return;
        const level = gameLevel.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);
        
        // Hent blocks rundt target
        let targetBlock, bottomBlock, topBlock, leftBlock, rightBlock;
        let bottom, top, left, right;

        // TARGET
        if (level[gridY] && level[gridY][gridX]){
            targetBlock = BLOCKS[level[gridY][gridX]];
        }

        // BOTTOM
        if (level[gridY + 1] && level[gridY + 1][gridX]) {
            bottom = BLOCKSIZE * (gridY + 1 - 0.5);
            bottomBlock = BLOCKS[level[gridY + 1][gridX]];
        }

        // TOP
        if (level[gridY - 1] && level[gridY - 1][gridX]) {
            top = BLOCKSIZE * (gridY - 1 + 0.5);
            topBlock = BLOCKS[level[gridY - 1][gridX]];
        }

        // LEFT
        if (level[gridY] && level[gridY][gridX - 1]) {
            left = BLOCKSIZE * (gridX - 1 + 0.5);
            leftBlock = BLOCKS[level[gridY][gridX - 1]];
        }

        // RIGHT
        if (level[gridY] && level[gridY][gridX + 1]) {
            right = BLOCKSIZE * (gridX + 1 - 0.5);
            rightBlock = BLOCKS[level[gridY][gridX + 1]];
        }
        
        // COLLISION DETECTION
        // AIR FRICTION
        if (targetBlock){            
            if (!targetBlock.solid) {
                if (targetBlock.friction) {
                    if (target.vx > 0.09) {
                        target.vx -= targetBlock.friction;
                    } else if (target.vx < -0.09) {
                        target.vx += targetBlock.friction;
                    } else {
                        target.vx = 0;
                    }
                }
            }
        }

        // BOTTOM
        if (bottom && (target.bottom >= bottom)) {
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
        target.vy += factor * Math.sin(angle);
    }

    private updatePlayer(player: Player): void{
        // Midlertidig
        const step = 10;
        if (this.noclip){
            player.vx = 0;
            player.vy = 0;
            if (player.w) player.y -= step;
            if (player.a) player.x -= step;
            if (player.s) player.y += step;
            if (player.d) player.x += step;

        } else {
            if (player.w && player.vy === 0) this.applyForce(player, 12, -Math.PI/2);
            // if (player.w) player.y -= step;
            if (player.a) this.applyForce(player, 1.5, -Math.PI);
            // if (player.s) player.y += step;
            if (player.d) this.applyForce(player, 1.5, 0);
        }
    }

    private updateNPC(npc: NPC): void {
        if(npc.a) {
            this.applyForce(npc, npc.speed, -Math.PI);
        }
        if(npc.d) {
            this.applyForce(npc, npc.speed, 0);
        }
        if(npc.w && npc.vy <= 1e-15 && npc.vy >= -1e-15) {
            this.applyForce(npc, npc.jumpheight, -Math.PI/2);
        }

        if (npc.healthCurrent <= 0){

        }

    }

    //foreløpig ikke kollisjon med bakke
    public checkCollisionProjectiles(entities: InstanceType<typeof GameObject>[], projectiles: InstanceType<typeof Projectile>[], level: Room){
        let filtered = entities.filter(<(t: GameObject) => t is NPC>(t => t instanceof NPC))
        
        //ytre lykke som går igjennom NPC
        for (let n = 0; n < filtered.length; n++){
            // indre lykke som går igjennom prosjektiler
            for (let p = 0; p < projectiles.length; p++){
                // få lengden mellom prosjektil og NPC
                let len = Math.hypot(filtered[n].x - projectiles[p].x, filtered[n].y - projectiles[p].y);
                if (len > THRESHOLD_ACCURATE_PROJECTILE_MODE) continue;
                let targ = filtered[n];
                let proj = projectiles[p];
                if (proj.shooter === targ) continue;                

                if (proj.bottom > targ.top && proj.top < targ.bottom){
                    if (proj.right > targ.left && proj.left < targ.right){
                        proj.hit.call(false, targ);

                        targ.healthCurrent -= proj.damage;
                        targ.healthCurrent = targ.healthCurrent < 0 ? 0 : targ.healthCurrent;

                        projectiles.splice(p, 1);
                        p--;     
                    }
                }
            }
        }

        for (let p = 0; p < projectiles.length; p++){
            let proj = projectiles[p];
            let gridX = Math.round(proj.x / BLOCKSIZE);
            let gridY = Math.round(proj.y / BLOCKSIZE);

            let grid = level.data;
            
            if (grid[gridY] && grid[gridY][gridX]){                
                if (BLOCKS[grid[gridY][gridX]].solid){                                                            
                    if (
                        proj.x > gridX * BLOCKSIZE - 0.5 * BLOCKSIZE ||
                        proj.x < gridX * BLOCKSIZE + 0.5 * BLOCKSIZE ||
                        proj.y > gridY * BLOCKSIZE - 0.5 * BLOCKSIZE ||
                        proj.y < gridY * BLOCKSIZE + 0.5 * BLOCKSIZE 
                    ){                        
                        
                        proj.hit.call(false, new Block)

                        projectiles.splice(p, 1);
                        p--;
                        continue;
                        
                    }

                }
            }
        }
        
    }

    private increaseKills(entities: GameObject[]): void {
        entities.forEach(entity => {
            if(entity instanceof Player) entity.kills++;
        });
    }

}


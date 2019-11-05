import { GameObject, NPC } from "../assets/core";
import { Biome } from "../assets/levels/biomes/biome";
import { BLOCKSIZE } from "./engine";
import { BLOCKS } from "../utility/level.loader";
import { Player } from "../assets/entities/player/player";

export class EnemyBehaviour {
    constructor(){}

    public update(entities: GameObject[], currentBiome: Biome): void {
        entities.forEach(entity => {
            if(entity instanceof NPC && !(entity instanceof Player)) {
                this.patrolSimple(entity, currentBiome);
            }
        });
    }

    private patrolSimple(target: GameObject, currentBiome: Biome){
        if(!(target instanceof NPC) || target instanceof Player) return;
        const biome = currentBiome.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

        // Om NPC er inntil en vegg eller ved en kant, bytt retning.
        if(target.d) {
           if(
               biome[gridY] &&
               biome[gridY][gridX + 1] &&
               BLOCKS[biome[gridY][gridX + 1]].solid
            ) {
               target.d = false;
               target.a = true;
           } else if(
               biome[gridY + 1] &&
               biome[gridY + 1][gridX + 1] &&
               !BLOCKS[biome[gridY + 1][gridX+1]].solid
            ) {
               target.d = false;
               target.a = true;
           }
        } 
        if(target.a) {
            if(
                biome[gridY] &&
                biome[gridY][gridX - 1] &&
                BLOCKS[biome[gridY][gridX - 1]].solid
            ) {
                target.a = false;
                target.d = true;
            } else if(
                biome[gridY + 1] &&
                biome[gridY + 1][gridX - 1] &&
                !BLOCKS[biome[gridY+1][gridX - 1]].solid
            ) {
                target.a = false;
                target.d = true;
            }
        }
    }
}
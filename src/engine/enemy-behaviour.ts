import { GameObject, NPC } from "../assets/core";
import { Biome } from "../assets/levels/biomes/biome";
import { BLOCKSIZE } from "./engine";
import { BLOCKS } from "../utility/level.loader";
import { Player } from "../assets/entities/player/player";

export class EnemyBehaviour {
    constructor(){}

    // Lengden NPC ser spilleren fra. Ikke fastsatt enda.
    private CHASE_RANGE: number = 300;

    /**
     * Oppdaterer fiende-logikk.
     * @param entities Array med alle spillobjektene.
     * @param currentBiome Biomen NPC befinner seg i.
     * @param player Spiller-objektet.
     */
    public update(entities: GameObject[], currentBiome: Biome, player: Player): void {
        entities.forEach(entity => {
            if(entity instanceof NPC && !(entity instanceof Player)) {
                if(entity.x - player.x <= this.CHASE_RANGE && entity.x - player.x >= -this.CHASE_RANGE) {
                    this.chasePlayer(entity, currentBiome, player);
                    this.aimAt(entity, player);
                } else {
                    this.patrolSimple(entity, currentBiome);
                }
            }
        });
    }

    /**
     * Enkel patrulje. NPC går frem og tilbake venstre til høyre til blokkering, og bytter retning.
     * @param target NPC det gjelder.
     * @param currentBiome Biomen NPC befinner seg i.
     */
    private patrolSimple(target: GameObject, currentBiome: Biome){
        if(!(target instanceof NPC) || target instanceof Player) return;

        target.w = false;
        target.speed = 1;
        target.vx = 0;

        const biome = currentBiome.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

        // Om NPC er inntil en vegg eller ved en kant, bytt retning.
        if(target.d) {
           if(this.blockedRight(biome, gridX, gridY)) {
               target.d = false;
               target.a = true;
           }
        } 
        if(target.a) {
            if(this.blockedLeft(biome, gridX, gridY)) {
                target.a = false;
                target.d = true;
            }
        }
    }
    
    /**
     * NPC jakter etter spiller, og hopper over blokkeringer.
     * @param target NPC det gjelder.
     * @param currentBiome Biomen NPC befinner seg i.
     * @param player Spiller-objektet.
     */
    private chasePlayer(target: GameObject, currentBiome: Biome, player: Player) {
        if(!(target instanceof NPC) || target instanceof Player) return;

        target.speed = 1.2;

        const biome = currentBiome.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

        // Hopp om blokkert på venstre eller høyre side.
        if(this.blockedLeft(biome, gridX, gridY) || this.blockedRight(biome, gridX, gridY)) {
            target.w = true;
        } else {
            target.w = false;
        }

        if(target.x > player.x) {
            target.a = true;
            target.d = false;
        } else {
            target.d = true;
            target.a = false;
        }
    }

    /**
     * Sjekker om NPC er blokkert på venstre side, enten av en vegg eller et hull.
     * @param biome biome-data fra biomet NPC befinner seg i.
     * @param gridX X-akse grid-posisjon til NPC
     * @param gridY Y-akse grid-posisjon til NPC
     */
    private blockedLeft(biome: string[][], gridX: number, gridY: number): Boolean {
        if(
            biome[gridY] &&
            biome[gridY][gridX - 1] &&
            BLOCKS[biome[gridY][gridX - 1]].solid
        ) {
            return true;
        } else if(
            biome[gridY + 1] &&
            biome[gridY + 1][gridX - 1] &&
            !BLOCKS[biome[gridY+1][gridX - 1]].solid
        ) {
            return true;
        }

        return false;
    }

    /**
     * Sjekker om NPC er blokkert på høyre side, enten av en vegg eller et hull.
     * @param biome biome-data fra biomet NPC befinner seg i.
     * @param gridX X-akse grid-posisjon til NPC
     * @param gridY Y-akse grid-posisjon til NPC
     */
    private blockedRight(biome: string[][], gridX: number, gridY: number): Boolean {
        if(
            biome[gridY] &&
            biome[gridY][gridX + 1] &&
            BLOCKS[biome[gridY][gridX + 1]].solid
         ) {
            return true;
        } else if(
            biome[gridY + 1] &&
            biome[gridY + 1][gridX + 1] &&
            !BLOCKS[biome[gridY + 1][gridX+1]].solid
         ) {
            return true;
        }

        return false;
    }

    /**
     * Setter angle til en NPC direkte mot et annet.
     * @param origin NPC som sikter.
     * @param target NPC som blir siktet på.
     */
    private aimAt(origin: GameObject, target: GameObject): void {
        if(!(origin instanceof NPC) || !(target instanceof NPC)) return;

        origin._angle = Math.atan2(target.y - origin.y, target.x - origin.x);
    }
}
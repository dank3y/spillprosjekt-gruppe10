import { GameObject, NPC } from "../assets/entities/core";
import { Room } from "../assets/rooms/room";
import { BLOCKSIZE } from "./engine";
import { BLOCKS } from "../utility/level.loader";
import { Player } from "../assets/entities/player/player";

export class EnemyBehaviour {
    constructor(){}

    // Lengden NPC ser spilleren fra. Ikke fastsatt enda.
    private CHASE_RANGE_X: number = 300;
    private CHASE_RANGE_Y: number = 150;

    /**
     * Oppdaterer fiende-logikk.
     * @param entities Array med alle spillobjektene.
     * @param gameLevel Spillnivået.
     * @param player Spiller-objektet.
     */
    public update(entities: GameObject[], gameLevel: Room, player: Player): void {
        entities.forEach(entity => {
            if(entity instanceof NPC && !(entity instanceof Player)) {
                if(entity.x - player.x <= this.CHASE_RANGE_X && entity.x - player.x >= -this.CHASE_RANGE_X) {
                    if(entity.y - player.y <= this.CHASE_RANGE_Y && entity.y - player.y >= -this.CHASE_RANGE_Y) {
                        this.chasePlayer(entity, gameLevel, player);
                        this.aimAt(entity, player);
                    }
                } else {
                    this.patrolSimple(entity, gameLevel);
                }
            }
        });
    }

    /**
     * Enkel patrulje. NPC går frem og tilbake venstre til høyre til blokkering, og bytter retning.
     * @param target NPC det gjelder.
     * @param gameLevel Spillnivået.
     */
    private patrolSimple(target: GameObject, gameLevel: Room){
        if(!(target instanceof NPC) || target instanceof Player) return;

        target.w = false;
        target.speed = 1;
        target.vx = 0;

        const level = gameLevel.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

        // Om NPC er inntil en vegg eller ved en kant, bytt retning.
        if(target.d) {
           if(this.blockedRight(level, gridX, gridY)) {
               target.d = false;
               target.a = true;
               target._angle = Math.PI;
           }
        } 
        if(target.a) {
            if(this.blockedLeft(level, gridX, gridY)) {
                target.a = false;
                target.d = true;
                target._angle = 0;
            }
        }
    }
    
    /**
     * NPC jakter etter spiller, og hopper over blokkeringer.
     * @param target NPC det gjelder.
     * @param gameLevel Spillnivået.
     * @param player Spiller-objektet.
     */
    private chasePlayer(target: GameObject, gameLevel: Room, player: Player) {
        if(!(target instanceof NPC) || target instanceof Player) return;

        target.speed = 1.2;

        const level = gameLevel.data;
        
        // Få posisjon i grid
        const gridX = Math.round(target.x / BLOCKSIZE);
        const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

        // Hopp om blokkert på venstre eller høyre side.
        if(this.blockedLeft(level, gridX, gridY) || this.blockedRight(level, gridX, gridY)) {
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
     * @param level blokk-data fra spillnivået.
     * @param gridX X-akse grid-posisjon til NPC
     * @param gridY Y-akse grid-posisjon til NPC
     */
    private blockedLeft(level: string[][], gridX: number, gridY: number): Boolean {
        if(
            level[gridY] &&
            level[gridY][gridX - 1] &&
            BLOCKS[level[gridY][gridX - 1]].solid
        ) {
            return true;
        } else if(
            level[gridY + 1] &&
            level[gridY + 1][gridX - 1] &&
            !BLOCKS[level[gridY+1][gridX - 1]].solid
        ) {
            return true;
        }

        return false;
    }

    /**
     * Sjekker om NPC er blokkert på høyre side, enten av en vegg eller et hull.
     * @param level blokk-data fra spillnivået.
     * @param gridX X-akse grid-posisjon til NPC
     * @param gridY Y-akse grid-posisjon til NPC
     */
    private blockedRight(level: string[][], gridX: number, gridY: number): Boolean {
        if(
            level[gridY] &&
            level[gridY][gridX + 1] &&
            BLOCKS[level[gridY][gridX + 1]].solid
         ) {
            return true;
        } else if(
            level[gridY + 1] &&
            level[gridY + 1][gridX + 1] &&
            !BLOCKS[level[gridY + 1][gridX+1]].solid
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
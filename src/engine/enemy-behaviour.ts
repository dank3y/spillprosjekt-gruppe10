import { GameObject, NPC } from "../assets/entities/core";
import { Room } from "../assets/rooms/room";
import { BLOCKSIZE } from "./engine";
import { BLOCKS } from "../utility/level.loader";
import { Player } from "../assets/entities/player/player";
import { difficulty } from "../engine/engine";

export class EnemyBehaviour {
    constructor(){}

    // Lengden NPC ser spilleren fra. Ikke fastsatt enda.
    private CHASE_RANGE_X: number = 300 * difficulty;
    private CHASE_RANGE_Y: number = 150 * difficulty;
    private SHOOT_RANGE: number = 100 * difficulty;

    /**
     * Oppdaterer fiende-logikk.
     * @param entities Array med alle spillobjektene.
     * @param gameLevel Spillnivået.
     * @param player Spiller-objektet.
     */
    public update(entities: GameObject[], gameLevel: Room, player: Player): void {
        entities.forEach(entity => {
            if(entity instanceof NPC && !(entity instanceof Player)) {
                entity.weapon.leftInMag === 0 ? entity.reload = true : entity.reload = false;
                console.log(entity.reload);

                if(entity.y - player.y <= this.CHASE_RANGE_Y && entity.y - player.y >= -this.CHASE_RANGE_Y) {
                    if(entity.x - player.x <= this.SHOOT_RANGE && entity.x - player.x >= -this.SHOOT_RANGE) {
                        this.shootPlayer(entity, player);
                        this.aimAt(entity, player);
                    } else if(entity.x - player.x <= this.CHASE_RANGE_X && entity.x - player.x >= -this.CHASE_RANGE_X) {
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
        target.attack = false;

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

        target.speed = 2.4 * difficulty / 2;
        target.attack = false;

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

    private shootPlayer(origin: GameObject, target: GameObject) {
        if(!(target instanceof NPC) || !(origin instanceof NPC) || origin instanceof Player) return;

        origin.w = false;
        origin.a = false;
        origin.s = false;
        origin.d = false;
        origin.vx = 0;

        let goalAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
        if(origin._angle - goalAngle < 0.27 && origin._angle - goalAngle > -0.27) {
            origin.attack = true;
        } else {
            origin.attack = false;
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

        let goalAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
        let originAngle = origin._angle;
        origin._angle = this.lerp(originAngle, goalAngle, 0.03 * (difficulty / 0.5));
    }

    private lerp (start: number, end: number, amt: number){
        return (1-amt)*start+amt*end;
      }
}
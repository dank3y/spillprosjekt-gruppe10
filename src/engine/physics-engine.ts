import { PhysicsBody, GameObject, NPC } from "../assets/core";
import { Player } from "../assets/entities/player/player";
import { Dummy } from "../assets/entities/dummy/dummy";

/**
 * skal håndtere tyngdekraft osv
 */
export class PhysicsEngine {
    constructor(){}

    public g = 9.81;

    update(entities: GameObject[]): void{        
        entities.forEach((entity, index) => {
            //særtilfelle for spiller               
            if (entity.isExtentionOf(Player)) this.updatePlayer(<Player>entity);
            //alle ting som reagerer på tyngdekraft
            if (entity.isExtentionOf(PhysicsBody)){
                // this.applyGraviy(<PhysicsBody>entity);
                this.updatePhysicsBody(<PhysicsBody>entity);
            } 
            
        })
    }

    private updatePhysicsBody(target: PhysicsBody): void {
        // tyngdekraft        
        this.applyGraviy(target);
        target.x += target.dx;
        target.y += target.dy;
        if (target.y + 0.5 * target.height >= 0) { 
            target.y = -0.5 * target.height;
            target.dy = 0;
        }
    }

    private applyGraviy(target: PhysicsBody): void {
        // legg til tyngdekraft over 60 frames (1 sekund)
        target.dy += target.mass * this.g / 1000; 
    }

    applyForce(target: PhysicsBody, factor: number, angle: number): void {
        target.dx += factor * Math.cos(angle);
        target.dy += factor * Math.sin(angle);
    }

    private updatePlayer(player: Player): void{
        // midlertidig
        const step = 5;
        if (player.w && player.dy === 0) this.applyForce(player, 10, -Math.PI/2);
        if (player.a) player.x -= step;
        if (player.s) player.y += step;
        if (player.d) player.x += step;
    }

}


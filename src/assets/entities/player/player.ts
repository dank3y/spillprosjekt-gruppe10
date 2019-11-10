import { PhysicsBody, NPC } from "../core";
// definer sprite-en her
const sprite = require('./sprite.png');

/**
 * @param width valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 * @param height valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 */
export class Player extends NPC {

    //boolean verdier som tilsier om knappene er trykket ned
    constructor(
        x: number,
        y: number,
        width?: number,
        height?: number,
        mass?: number,
        vx: number = 0,
        vy: number = 0,
        angle: number = 0,
        ){
        super(x, y, sprite, width, height, mass, vx, vy, angle);
        // legg til key-events
        window.onkeydown = (ev: KeyboardEvent) => this.KEYDOWN_EVENT_HANDLER(ev);
        window.onkeyup = (ev: KeyboardEvent) => this.KEYUP_EVENT_HANDLER(ev);
    }

    private KEYDOWN_EVENT_HANDLER(event: KeyboardEvent): void {
        switch (event.key) {
            case 'w': this.w = true; break;
            case 'a': this.a = true; break;
            case 's': this.s = true; break;
            case 'd': this.d = true; break;
        }
    }

    private KEYUP_EVENT_HANDLER(event: KeyboardEvent): void {
        switch (event.key) {
            case 'w': this.w = false; break;
            case 'a': this.a = false; break;
            case 's': this.s = false; break;
            case 'd': this.d = false; break;
        }
    }
}
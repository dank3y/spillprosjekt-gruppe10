import { PhysicsBody } from "../../core";
// definer sprite-en her
const sprite = require('./sprite.png');

/**
 * @param width valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 * @param height valgfritt, hvis ikke oppgitt så finner den bredde utifra bildets bredde
 */
export class Player extends PhysicsBody {

    //boolean verdier som tilsier om knappene er trykket ned
    public w: boolean = false;
    public a: boolean = false;
    public d: boolean = false;
    public s: boolean = false;


    constructor(
        public x: number,
        public y: number,
        width?: number,
        height?: number,
        ){
        super(x, y, sprite);
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
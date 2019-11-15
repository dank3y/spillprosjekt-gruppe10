/**
 * En wrapper for Canvas. Evt ha litt nyttige funksjoner her
 * @param <HTMLCanvasElement> [c] Canvas-element i DOM
 */
export class Canvas {

    public ctx: CanvasRenderingContext2D;

    constructor(private c: HTMLCanvasElement) {
        // skaper en forbinnelse til Canvas-elementet i HTML
        this.ctx = c.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        c.addEventListener('mousemove', (ev: MouseEvent) => {
            this.onmousemove.call(false, ev);
        });
        c.addEventListener('mousedown', (ev: MouseEvent) => {
            this.onmousedown.call(false, ev)
        })
        c.addEventListener('mouseup', (ev: MouseEvent) => {
            this.onmouseup.call(false, ev)
        })
        c.addEventListener('resize', () => {
            console.log('ree');
            
            this.resizeCanvas();
            this.onresize.call(false);
        })
        
    }

    get width()  { return this.c.width; }
    get height() { return this.c.height; }

    // event til når mus beveger seg
    public onmousemove: Function = () => {};
    public onmousedown: Function = () => { };
    public onmouseup: Function = () => {};
    public onresize: Function = () => {};


    /**
     * Endre størrelsen på canvas, slik at én pixel er én ekte pixel
     */ 
    public resizeCanvas(): void {       
        const rect = this.c.parentElement.getBoundingClientRect();
        this.c.width = rect.width;
        this.c.height = rect.height;
    }

    /**
     * Tøm canvas for piksler
     */
    public clear(): void {
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        this.ctx.closePath();
    }

}
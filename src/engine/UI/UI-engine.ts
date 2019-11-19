import { Canvas } from "../canvas";

export type UIGroup = UIElement[];
export type pct = 'start' | 'middle' | 'end' | string;

/**
 * @param width bredde på "boksen"
 * @param height høyde på "boksen"
 */
export class UIElement {

    public onclick: Function = (): void => {}
    public draw: (ctx: CanvasRenderingContext2D) => void;

    public width: number;
    public height: number;
    public x: number | string;
    public y: number | string;
    public mode: 'float' | 'precise';

    /**
    * UI element med float-posisjon
    * @param width bredde på "boksen"
    * @param height høyde på "boksen"
    */
    constructor(width: number, height: number)

    // /**
    //  *  UI Element  
    //  *
    //  */
    // constructor(x: number | pct, y: number | pct)

    /**
    * UI Element med nøyaktig posisjon
    * @param width bredde på "boksen"
    * @param height høyde på "boksen"
    * @param x høyde på "boksen"
    * @param y høyde på "boksen"
     */
    constructor(width: number, height: number, x: number | pct, y: number | pct)
    constructor(width?: number, height?: number, x?: number | pct, y?: number | pct){
        if (width && height && !(x || y)) {
            this.width = width;
            this.height = height;
            this.mode = 'float';
        } else {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.mode = 'precise';
        }        
    }
}

export class UIEngine {

    get ctx() { return this.canvas.ctx }
    
    public elements: (UIElement | UIGroup)[] = [];
    //dimensjoner på vinduet
    constructor(public canvas: Canvas){
        // this.ctx.drawImage()
        // this.ctx.drawImage
    }

    addElement(e: InstanceType<typeof UIElement>){
        this.elements.push(e);
    }

    parseString(str: string, full: number): number{
        switch (str) {
            case 'start':  return 0;
            case 'middle': return 0.5 * full;
            case 'end': return 1 * full;
            default: return Number("0." + str.split('%')[0] || 0) * full;
        }
    }

    drawElement(e: InstanceType<typeof UIElement>){                
        if ((<Object>e).hasOwnProperty('x') && (<Object>e).hasOwnProperty){            
            let x: number | string = e.x;
            let y: number | string = e.y;
            if (typeof e.x === 'string'){
                let offset;
                if (e.x === 'end') offset = -e.width;
                if (e.x === 'middle') offset = -0.5 * e.width;
                if (e.x === 'start') offset = 0;
                x = this.parseString(e.x, this.canvas.width) + offset;
            } else {
                x = e.x;
            }
            if (typeof e.y === 'string'){                
                let offset;
                if (e.y === 'end') offset = -e.height;
                if (e.y === 'middle') offset = -0.5 * e.height;
                if (e.y === 'start') offset = 0;                
                y = this.parseString(e.y, this.canvas.height) + offset;                
            } else {
                y = e.y;
            }            
            this.ctx.translate(x, y);
        }
        
        e.draw(this.ctx);
    }

    renderElements(): void {
        this.elements.forEach(elem => {
            if (Array.isArray(elem)){
                this.ctx.beginPath();
                this.ctx.save();
                
                // elem.forEach(elem => {                    
                    
                // })
                this.ctx.restore();
                this.ctx.closePath();
            } else {
                this.ctx.beginPath();
                this.ctx.save();                
                this.drawElement(elem);                
                this.ctx.restore();
                this.ctx.closePath();
            }
        })
    }

}
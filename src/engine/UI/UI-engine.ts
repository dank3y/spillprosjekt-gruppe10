import { Canvas } from "../canvas";

export type pct = 'start' | 'middle' | 'end' | string;

function FIND_WIDTH(arr: {width: number}[]): number {
    let largest = 0;
    arr.forEach(v => {
        if (v.width > largest) largest = v.width;
    }) 
    return largest;
}

function FIND_HEIGHT(arr: { height: number }[]): number {
    let largest = 0;
    arr.forEach(v => {
        if (v.height > largest) largest = v.height;
    })
    return largest;
}



/**
* Gruppe med UI elementer. Ikke klikkbar osv
* @param direction - hvilken vei gruppen skal tegnes
* @param e - UIElementer som skal tegnes
*/
export class UIElementGroup{

    public elements: InstanceType<typeof UIElement>[] = [];
    
    constructor(
        public x: number | pct,
        public y: number | pct,
        public direction: 'row' | 'column',
        ...e: InstanceType<typeof UIElement>[]
    ){        
        this.elements.push(...e);      
    }

    get width(): number {
        if (this.direction === 'column'){
            return this.elements.reduce((c, v) => c + v.width, 0)
        } else {
            return FIND_WIDTH(this.elements);
        }
    }
    get height(): number {
        if (this.direction === 'column'){
            return FIND_HEIGHT(this.elements);
        } else {
            return this.elements.reduce((c, v) => c + v.height, 0)
        }
    }

}

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
        } else {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
        }        
    }
}

export class UIEngine {

    get ctx() { return this.canvas.ctx }
    
    public elements: (UIElement | UIElementGroup)[] = [];
    //dimensjoner på vinduet
    constructor(public canvas: Canvas){
    }

    addElements(...e: (InstanceType<typeof UIElement> | UIElementGroup)[]){
        this.elements.push(...e);
    }

    parseString(str: string, full: number): number{
        switch (str) {
            case 'start':  return 0;
            case 'middle': return 0.5 * full;
            case 'end': return 1 * full;
            default: return Number("0." + str.split('%')[0] || 0) * full;
        }
    }

    drawElementGroup(e: UIElementGroup){
        let x: number;
        let y: number;
        //sjekk om procentverdi eller hard verdi
        if (typeof e.x === 'string') {
            let offset = 0;
            //hvis det er en dynamisk innstilling så ta med offset
            if (e.x === 'end') offset = -e.width;
            if (e.x === 'middle') offset = -0.5 * e.width;
            if (e.x === 'start') offset = 0;
            x = this.parseString(e.x, this.canvas.width) + offset;
        } else {
            x = e.x;
        }
        if (typeof e.y === 'string') {
            let offset = 0;
            if (e.y === 'end') offset = -e.height;
            if (e.y === 'middle') offset = -0.5 * e.height;
            if (e.y === 'start') offset = 0;
            y = this.parseString(e.y, this.canvas.height) + offset;
        } else {
            y = e.y;
        }
        this.ctx.translate(x, y);
        let el = e.elements;

        for (let i = 0; i < el.length; i++){
            el[i].draw(this.ctx)
            if (e.direction == 'row'){
                this.ctx.translate(0, el[i].height);
            } else {
                this.ctx.translate(el[i].width, 0)
            }
        }
        
    }

    drawElement(e: InstanceType<typeof UIElement>){                
        if ((<Object>e).hasOwnProperty('x') && (<Object>e).hasOwnProperty){            
            let x: number | string = e.x;
            let y: number | string = e.y;
            if (typeof e.x === 'string'){
                let offset = 0;
                if (e.x === 'end') offset = -e.width;
                if (e.x === 'middle') offset = -0.5 * e.width;
                if (e.x === 'start') offset = 0;
                x = this.parseString(e.x, this.canvas.width) + offset;
            } else {
                x = e.x;
            }
            if (typeof e.y === 'string'){                
                let offset = 0;
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
            if (elem instanceof UIElement) {
                this.ctx.beginPath();
                this.ctx.save();                
                this.drawElement(elem);                
                this.ctx.restore();
                this.ctx.closePath();
            } else if (elem instanceof UIElementGroup){
                this.ctx.beginPath();
                this.ctx.save();
                this.drawElementGroup(elem);
                this.ctx.restore();
                this.ctx.closePath();
            }
        })
    }

}
import '../main.css';
import { Canvas } from "./engine/canvas";
import { GameEngine } from "./engine/engine";


const c = <HTMLCanvasElement>document.getElementById('canvas');
const canvas = new Canvas(c);

const engine = new GameEngine(canvas);

engine.renderer.config.zeroDot = false;
engine.renderer.config.drawLookDirection = false;
engine.renderer.config.drawZeroLine = false;
engine.renderer.config.drawWireframe = false;

setInterval(() => {
    // engine.renderer.drawBlock(BLOCKS['base'], 0, 0)
    engine.loop();
}, 1/60*1000);
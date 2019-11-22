/**
 * Spillet vårt begynner i denne filen. 
 * Her lages spillmotoren, og så kjøres den 60 ganger i sekundet.
 */

import '../main.css';
import { Canvas } from './engine/canvas';
import { GameEngine } from './engine/engine';

const c: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const canvas: Canvas = new Canvas(c);

const engine: GameEngine = new GameEngine(canvas);

engine.renderer.config.zeroDot = false;
engine.renderer.config.drawLookDirection = false;
engine.renderer.config.drawZeroLine = false;
engine.renderer.config.drawWireframe = false;

/**
 * Starter spillmotoren.
 */
setInterval(() => {
    engine.loop();
}, 1/60*1000);
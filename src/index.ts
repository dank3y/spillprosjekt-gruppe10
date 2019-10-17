import '../main.css';
import { Canvas } from "./engine/canvas";
import { GameEngine } from "./engine/engine";
import { Player } from './assets/entities/player/player';
import { Dummy } from './assets/entities/dummy/dummy'
import { BLOCKS } from './utility/level.loader';
import { DefaultBiome } from './assets/levels/biomes/default/default.biome';


const c = <HTMLCanvasElement>document.getElementById('canvas');
const canvas = new Canvas(c);

const engine = new GameEngine(canvas);

// let dummy  = new Dummy(100, 0, 50, 100);
// engine.entities.push(dummy);

let player = new Player(0,0, 32, 64, 80, 0, 0, 0);
engine.addBiome(DefaultBiome, 'left');
engine.entities.push(player);
engine.renderer.camera.lookAt(player);
engine.renderer.config.zeroDot = false;
engine.renderer.config.drawLookDirection = true;
engine.renderer.config.drawZeroLine = false;


setTimeout(() => {
    // engine.renderer.camera.lookAt(dummy);
}, 3000)


setInterval(() => {
    player._angle += 0.01;
    // engine.renderer.drawBlock(BLOCKS['base'], 0, 0)
    engine.loop()
}, 1/60*1000);
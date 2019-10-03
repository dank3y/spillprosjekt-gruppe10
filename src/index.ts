import '../main.css';
import { Canvas } from "./engine/canvas";
import { GameEngine } from "./engine/engine";
import { Player } from './assets/entities/player/player';

const c = <HTMLCanvasElement>document.getElementById('canvas');
const canvas = new Canvas(c);

const engine = new GameEngine(canvas);

let player = new Player(0,0);

engine.sprites.push(player);



//skal senere deles opp i ett separat physics- og draw-loop
setInterval(() => {
    player.x += 1;
    engine.camera.lookAt(player);
    engine.drawFrame();
}, 1/60*1000);
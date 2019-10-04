import '../main.css';
import { Canvas } from "./engine/canvas";
import { GameEngine } from "./engine/engine";
import { Player } from './assets/entities/player/player';
import { Dummy } from './assets/entities/dummy/dummy';

const c = <HTMLCanvasElement>document.getElementById('canvas');
const canvas = new Canvas(c);

const engine = new GameEngine(canvas);

let dummy  = new Dummy(100, 0, 50, 100);

let player = new Player(0,0);

engine.sprites.push(player, dummy);



//skal senere deles opp i ett separat physics- og draw-loop
setInterval(() => {
    //player.x += 1;
    engine.camera.lookAt(player);
    engine.drawFrame();
}, 1/60*1000);
import { ROOMDATA, ROOMIMAGE } from "../assets/rooms/room10/room10.room";

export const blocksHex: { [key: string]: string } = {
  '#ffffff': 'air',
  '#000': 'base',
}

export const BLOCKS: { [key: string]: Block } = {
  'air' : { solid: false, friction: 1, defaultColor: ''},
  'base': { solid: true,  bounce: 0.0, friction: 1.0, defaultColor: '#000000' },
  'bouncePad': { solid: true, bounce: 1.1, friction: 1.0, defaultColor: '#FF0000' },
}

export class Block {
    solid: boolean;
    friction: number;
    defaultColor: string;
    bounce?: number;
    texture?: string;
}

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej();
    }, 2000)
    let img = new Image();
    img.src = src;
    img.onload = () => {
      res(img);
    }
  })
}


const convertImage = async (source: string): Promise<string[][]> => {

  let img = await loadImg(source);

  let c = document.createElement('canvas');
  let ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  let level: any[] = [];
  
  for (let y = 0; y < h; y++) {
    let xLevel: any[] = [];
    for (let x = 0; x < w; x++) {
      xLevel.push(
        '#' + String(Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0,3).map(t => t.toString(16)).join(''))
      )
    }
    level.push(xLevel);
  }

  return level;
}

export function convertData(data: string[][]){  
  return data.map(row => row.map(t => blocksHex[t]));
}

export function writeToNewWindow(data: string[][]): void {
  let w = window.open('', '_blank');
  w.document.write(JSON.stringify(data));
}

/*
(async () => {
   // endre på denne
   let img = ROOMIMAGE;
   let data = await convertImage(img);
  console.log(data);
   let fin = convertData(data);
   console.log(fin);
   writeToNewWindow(fin);
})()
*/
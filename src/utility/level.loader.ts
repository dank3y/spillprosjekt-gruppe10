import { DefaultBiome } from "../assets/levels/biomes/default/default.biome";

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej();
    }, 2000)
    let img = new Image();
    img.src = src;
    img.onload = () => {
      res(img)
    }
  })
}


const loadLevel = async (source: string): Promise<void> => {

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
        ctx.getImageData(x, y, 1, 1).data.slice(0, 2)
      )
    }
    level.push(xLevel);
  }

  let t = window.open('', '_blank');
      t.document.body.style.fontFamily = 'monospace';
      t.document.write(JSON.stringify(level));
  

}

// let test = DefaultBiome;
// loadLevel(test);


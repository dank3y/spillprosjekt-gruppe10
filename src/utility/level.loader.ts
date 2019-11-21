import { ROOMIMAGE } from '../assets/rooms/room4/room4.room';

/**
 * Brukes til å oversette fargedata fra bilde til blokknavn.
 */
export const blocksHex: { [key: string]: string } = {
  '#ffffff': 'air',
  '#000000': 'base',
  '#00ff00': 'wall'
}

/**
 * Holder egenskapene til de forskjellige blokkene i spillet.
 */
export const BLOCKS: { [key: string]: Block } = {
	'wall' : { solid: false, friction: 1, defaultColor: '#FFFFFF'},
	'air' : { solid: false, friction: 1, defaultColor: ''},
	'base': { solid: true,  bounce: 0.0, friction: 1.0, defaultColor: '#000000' }
}

/**
 * Grunnleggende byggeklosser i spillnivået.
 */
export class Block {
	solid: boolean;
	friction: number;
	defaultColor: string;
	bounce?: number;
	texture?: string;
}

/**
 * Laster inn et bilde til konverting.
 * @param src Bildet som skal brukes.
 */
async function loadImg(src: string): Promise<HTMLImageElement> {
	return new Promise((res, rej) => {
		setTimeout(() => {
			rej();
		}, 2000);
	
		let img: HTMLImageElement = new Image();
		img.src = src;
		img.onload = () => {
			res(img);
		}
	});
}

/**
 * Konverterer et bilde til et array av piksler.
 * @param source Bildet som skal brukes.
 */
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
			);
		}
		level.push(xLevel);
	}

	return level;
}

/**
 * Konverterer piksel-data til blokk-data for et spillnivå.
 * @param data Piksel-data fra et bilde.
 */
function convertData(data: string[][]){  
	return data.map(row => row.map(t => blocksHex[t]));
}

/**
 * Skriver blokk-data til et nytt vindu.
 * @param data Blokk-data for et spillnivå.
 */
function writeToNewWindow(data: string[][]): void {
	let w = window.open('', '_blank');
	w.document.write(JSON.stringify(data));
}

/**
 * Bygger rom-data i JSON-format fra oppgitt bilde.
 */
// (async () => {
// 	let img = ROOMIMAGE;
// 	let data = await convertImage(img);
// 	let fin = convertData(data);
// 	writeToNewWindow(fin);
// })();
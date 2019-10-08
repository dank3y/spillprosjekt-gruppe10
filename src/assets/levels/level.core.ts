

export type RGB = [number, number, number];
export type BiomeBackgound = Array<RGB[]>;

export class Biome {
  constructor(public source: string){}
  get divider(): number {
    return 1;
  }
  get background() {
    return 1;
  }

}

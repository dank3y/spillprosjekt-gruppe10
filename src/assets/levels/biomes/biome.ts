/*
Hver biome har en datafil, som på forhånd er konvertert fra et bilde.
En biome må:
    * Starte og slutte på samme y-nivå. For øyeblikket er det ikke viktig at om de er partalls- eller oddetalls
      høye. Spilleren kan uansett hoppe over 2.5 blocks.

*/

export const BiomeList: Biome[] = [];

export class Biome {
    constructor(
        public data: string[][],
        public entities: any[],
        public props?: any[],
    ){
        // legg til seg selv i listen
        BiomeList.push(this);
    }
}
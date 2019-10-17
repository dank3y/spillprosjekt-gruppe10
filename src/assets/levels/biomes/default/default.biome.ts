import { Biome } from "../biome";

export const BIOMEIMAGE = require('./biome.png');
export const BIOMEDATA = require('./biome.data.json');

export const DefaultBiome: Biome = new Biome(
    BIOMEDATA,
    []
)
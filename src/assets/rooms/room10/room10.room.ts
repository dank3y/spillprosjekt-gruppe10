import { Room } from "../room";

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./room10.png');
export const ROOMENTITIES = require('./room.entities.json');

export const Room10: Room = new Room(
    ROOMDATA,
    ROOMENTITIES
);
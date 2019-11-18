import { Room } from "../room";

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./room4.png');
export const ROOMENTITIES = require('./room.entities.json');

export const Room4: Room = new Room(
    ROOMDATA,
    ROOMENTITIES
);
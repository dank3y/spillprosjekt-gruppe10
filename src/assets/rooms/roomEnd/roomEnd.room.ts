import { Room } from "../room";

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./roomEnd.png');
export const ROOMENTITIES = require('./room.entities.json');

export const RoomEnd: Room = new Room(
    ROOMDATA,
    ROOMENTITIES
);
import { Room } from "../room";

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./roomStart.png');

export const RoomStart: Room = new Room(
    ROOMDATA,
    []
);
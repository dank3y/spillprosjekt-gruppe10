import { Room } from '../room';

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./room7.png');
export const ROOMENTITIES = require('./room.entities.json');

export const Room7: Room = new Room(
	ROOMDATA,
	ROOMENTITIES
);
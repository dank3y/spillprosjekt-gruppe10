import { Room } from '../room';

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./room6.png');
export const ROOMENTITIES = require('./room.entities.json');

export const Room6: Room = new Room(
	ROOMDATA,
	ROOMENTITIES
);
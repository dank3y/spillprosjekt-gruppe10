import { Room } from '../room';

export const ROOMDATA = require('./room.data.json');
export const ROOMIMAGE = require('./room1.png');
export const ROOMENTITIES = require('./room.entities.json');

export const Room1: Room = new Room(
	ROOMDATA,
	ROOMENTITIES
);
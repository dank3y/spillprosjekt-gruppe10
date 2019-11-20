import { Room } from '../assets/rooms/room';
import { RoomStart } from '../assets/rooms/roomStart/roomStart.room';
import { RoomEnd } from '../assets/rooms/roomEnd/roomEnd.room';
import { Room1 } from '../assets/rooms/room1/room1.room';
import { Room2 } from '../assets/rooms/room2/room2.room';
import { Room3 } from '../assets/rooms/room3/room3.room';
import { Room4 } from '../assets/rooms/room4/room4.room';
import { Room5 } from '../assets/rooms/room5/room5.room';
import { Room6 } from '../assets/rooms/room6/room6.room';
import { Room7 } from '../assets/rooms/room7/room7.room';
import { Room8 } from '../assets/rooms/room8/room8.room';
import { Room9 } from '../assets/rooms/room9/room9.room';
import { Room10 } from '../assets/rooms/room10/room10.room';
import { BLOCKSIZE, difficulty } from "./engine";
import { Enemy } from "../assets/entities/enemy/enemy";
import { Goal } from "../assets/entities/goal/goal";
import { GameObject } from "../assets/entities/core";
import { NPC } from "../assets/entities/core";
import { SMG } from '../assets/weapons/smg/smg';
import { Pistol } from '../assets/weapons/pistol/pistol';
import { Shotgun } from '../assets/weapons/shotgun/shotgun';

export class LevelGen {
    constructor(){}

    /**
     * Genererer et level med et visst antall rom.
     */
    public makeLevel(): Room {
        const DEBUG_MODE = false;

        let ROOM_AMOUNT: number = 5;
        let AVAILABLE_ROOMS: Room[] = [Room1, Room2, Room3, Room4, Room5, Room6, Room7, Room8, Room9, Room10];

        // Antall rom som skal genereres. Start- og sluttrom legges til utenom.
        if(DEBUG_MODE) {
            ROOM_AMOUNT = 1;
            AVAILABLE_ROOMS = [Room3];
        }

        // Brukes for å plassere data riktig.
        let roomOffset: number = 0;

        let rooms: Array<[Room, number]> = [];

        // Legger til startrom.
        rooms.push([RoomStart, roomOffset]);
        roomOffset += RoomStart.data[0].length;

        // Legger til et tilfeldig rom fra listen og øker offset for hver gang.
        while(rooms.length <= ROOM_AMOUNT) {
            let randomRoom: number = Math.floor(Math.random()*AVAILABLE_ROOMS.length);
            if(AVAILABLE_ROOMS[randomRoom] === rooms[rooms.length-1][0]) continue;
            rooms.push([AVAILABLE_ROOMS[randomRoom], roomOffset]);

            roomOffset += AVAILABLE_ROOMS[randomRoom].data[0].length;
        }

        // Legger til sluttrom.
        rooms.push([RoomEnd, roomOffset]);

        // SETT SAMMEN ALT TIL LEVEL
        let levelData: string[][] = [];
        let levelEntities: InstanceType<typeof GameObject>[] = [];

        rooms.forEach(room => {
            let offset: number = room[1];

            room[0].data.forEach((y, yIndex) => {
                if(!levelData[yIndex]) levelData[yIndex] = [];
                y.forEach((x, xIndex) => {
                    levelData[yIndex][xIndex + offset] = x;
                });
            });

            room[0].entities.forEach(entity => {
                let entityX: number = entity[0] + BLOCKSIZE * offset;
                let entityY: number = entity[1];
                let entityType: string = entity[2];
                let entityObject: GameObject;

                let weaponRng: number = Math.floor(Math.random()*100)+1;
                let smgChance: number = Math.floor(difficulty*100) - 100;
                let shotgunChance: number = Math.floor(difficulty * 100) - 130;

                if(entityType === "enemy") {
                    entityObject = new Enemy(entityX, entityY, 32, 64);
                    if(entityObject instanceof NPC) {
                        if(weaponRng < shotgunChance) {
                            entityObject.weapons.push(new Shotgun(0, 0));
                        } else if(weaponRng < smgChance) {
                            entityObject.weapons.push(new SMG(0, 0));
                        } else {
                            entityObject.weapons.push(new Pistol(0, 0));
                        }
                        entityObject.healthMax = entityObject.healthMax * difficulty;
                        entityObject.healthCurrent = entityObject.healthCurrent * difficulty;
                    }
                } else if (entityType === "goal") {
                    entityObject = new Goal(entityX, entityY, 32, 64);
                }
                levelEntities.push(entityObject);
            });
        });
        const gameLevel = new Room(levelData, levelEntities);
        return gameLevel;
    }
}
import { Sprite, NPC, GameObject } from "../entities/core";

export interface Shoot {
  shoot: Function;
}

// RPM er Rounds Per Minute
export class Weapon extends Sprite implements Shoot {
  public leftInMag: number;
  public lastBullet: number = 0;

  public reloadStart: number = 0;
  public reloading: boolean = false;

  constructor(
    x: number,
    y: number,
    _sprite: string,
    public magSize: number,
    public reloadTime: number,
    public RPM: number,
    public recoil: number,
    width: number,
    height: number,
    public title: string
  ) {
    super(x, y, _sprite, width, height);

    this.leftInMag = this.magSize;
  }

  get RPMms() {
    return (60 / this.RPM) * 1000;
  }

  public shoot(list: Projectile[], shooter: NPC): void {};
}

// "g" tilsier hvor mye prosjektilet skal falle,
// vel tilsier hastighet
export class Projectile extends Sprite {
  constructor(
    x: number,
    y: number,
    _sprite: string,
    width: number,
    height: number,
    public angle: number,
    public g: number,
    public vel: number,
    public shooter: InstanceType<typeof NPC>
  ) {
    super(x, y, _sprite, width, height,);
  }
  
  update(){
    this.x += Math.cos(this.angle) * this.vel;
    this.y += Math.sin(this.angle) * this.vel;
  }

}
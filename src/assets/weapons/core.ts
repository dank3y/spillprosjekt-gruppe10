import { Sprite } from "../entities/core";



// ROF er Rate Of Fire, med enhet Rounds/min
export class Weapon extends Sprite {
  public leftInMag: number;
  public lastBullet: number;

  constructor(
    x: number,
    y: number,
    _sprite: string,
    public magSize: number,
    public reloadTime: number,
    public ROF: number,
    width: number,
    height: number,
  ) {
    super(x, y, _sprite, width, height);

    this.leftInMag = this.magSize;
  }
  shoot(): void {}
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
  ) {
    super(x, y, _sprite, width, height,);
  }
  
  update(){
    this.x += Math.cos(this.angle) * this.vel;
    this.y += Math.sin(this.angle) * this.vel;
  }

}
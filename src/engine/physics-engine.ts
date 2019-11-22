import { PhysicsBody, GameObject, NPC, Sprite } from '../assets/entities/core';
import { Player } from '../assets/entities/player/player';
import { Room } from '../assets/rooms/room';
import { BLOCKSIZE } from './engine';
import { BLOCKS, Block } from '../utility/level.loader';
import { Projectile } from '../assets/weapons/core';

const THRESHOLD_ACCURATE_PROJECTILE_MODE = 64;

/**
 * Skal håndtere tyngdekraft, fart og momentum.
 */
export class PhysicsEngine {
	constructor(){}

	// Gravitasjonskonstant
	public g = 9.81;

	// Debug-funksjon - gjør at spilleren kan bevege seg fritt gjennom nivået.
	public noclip: boolean = false;

	// Brukes til lyder.
	public projectileHit: (target: any) => void = () => {};
	public onjump: () => void = () => { };
	public onland: () => void = () => {};

	/**
	 * Oppdaterer alle objektene som blir påvirket av fysikk. 
	 * Dvs. alle som arver av typen physicsbody.
	 * @param entities Alle spillobjektene.
	 * @param gameLevel Spillnivået.
	 */
	update(entities: GameObject[], gameLevel: Room): void {        
		entities.forEach((entity, index) => {
			//særtilfelle for spiller               
			if (entity.isExtensionOf(Player)) this.updatePlayer(<Player>entity);
			// Beveg NPCer
			if(entity instanceof NPC && !(entity instanceof Player)) {
				this.updateNPC(entity);
				//sjekk om de er døde
				if (entity.healthCurrent <= 0) {
					entities.splice(index, 1); 
					this.increaseKills(entities);
				}
			}
			if (entity.isExtensionOf(PhysicsBody)){
				this.updatePhysicsBody(<PhysicsBody>entity, gameLevel);
			} 
		});
	}

	/**
	 * Oppdaterer posisjonen til objektet basert på fart,
	 * legger til tyngdekraft og sjekker kollisjon.
	 */
	private updatePhysicsBody(target: PhysicsBody, gameLevel: Room): void {
		target.x += target.vx;
		target.y += target.vy;

		// Begrenser maksfarten et objekt kan ha.
		if(target.vx > 12) target.vx = 12;
		if(target.vx < -12) target.vx = -12;
		if(target.vy > 16) target.vy = 16;
		if(target.vy < -16) target.vy = -16;

		this.applyGravity(target);
		this.checkGridCollision(target, gameLevel);
	}

	/**
	 * Collision detection. 
	 * Sjekker alle blokkene rundt spiller, og setter grenser 
	 * objektet ikke kan krysse om det er en blokk i veien.
	 */
	private checkGridCollision(target: PhysicsBody, gameLevel: Room){
		if (this.noclip && target instanceof Player) return;
		const level = gameLevel.data;

		// Få posisjon i grid
		const gridX = Math.round(target.x / BLOCKSIZE);
		const gridY = Math.round((target.y + 0.25 * target.height) / BLOCKSIZE);

		// Hent blokker rundt target, og setter grensene.
		let targetBlock, bottomBlock, topBlock, leftBlock, rightBlock;
		let bottom, top, left, right;

		// Blokken selve target er på.
		if (level[gridY] && level[gridY][gridX]){
			targetBlock = BLOCKS[level[gridY][gridX]];
		}

		// BOTTOM BLOCK
		if (level[gridY + 1] && level[gridY + 1][gridX]) {
			bottom = BLOCKSIZE * (gridY + 1 - 0.5);
			bottomBlock = BLOCKS[level[gridY + 1][gridX]];
		}

		// TOP BLOCK
		if (level[gridY - 1] && level[gridY - 1][gridX]) {
			top = BLOCKSIZE * (gridY - 1 + 0.5);
			topBlock = BLOCKS[level[gridY - 1][gridX]];
		}

		// LEFT BLOCK
		if (level[gridY] && level[gridY][gridX - 1]) {
			left = BLOCKSIZE * (gridX - 1 + 0.5);
			leftBlock = BLOCKS[level[gridY][gridX - 1]];
		}

		// RIGHT BLOCK
		if (level[gridY] && level[gridY][gridX + 1]) {
			right = BLOCKSIZE * (gridX + 1 - 0.5);
			rightBlock = BLOCKS[level[gridY][gridX + 1]];
		}

		// COLLISION DETECTION
		// Her sjekkes det om blokkene som ble funnet 
		// i forrige steg er solide eller ikke.

		// AIR FRICTION
		if (targetBlock){            
			if (!targetBlock.solid) {
				if (targetBlock.friction) {
					if (target.vx > 0.09) {
						target.vx -= targetBlock.friction;
					} else if (target.vx < -0.09) {
						target.vx += targetBlock.friction;
					} else {
						target.vx = 0;
					}
				}
			}
		}

		// BOTTOM
		if (bottom && (target.bottom >= bottom)) {
			if (bottomBlock.solid){                
				target.vy = 0;
				target.y  = bottom - 0.5 * target.height;
			}
		}

		// TOP
		if (top && (target.top <= top)) {
			if(topBlock.solid) {
				target.vy = 0.1;
				target.y = top + 0.5 * target.height;
			}
		}

		// LEFT
		if (left && (target.left <= left)) {
			if(leftBlock.solid) {
				target.vx = 0;
				target.x = left + 0.5 * target.width;
			}
		}

		// RIGHT
		if (right && (target.right >= right)) {
			if(rightBlock.solid) {
				target.vx = 0;
				target.x = right - 0.5 * target.width;
			}
		}
	}

	/**
	 * Legger til tyngdekraft over 60 frames (1 sekund).
	 */
	private applyGravity(target: PhysicsBody): void {
		target.vy += target.mass * this.g / 1000; 
	}

	/**
	 * Dytter et spillobjekt i en viss retning.
	 * @param target Spillobjekt som skal dyttes.
	 * @param factor Hvor kraftig det skal dyttes.
	 * @param angle Hvilken retning det skal dyttes (i radianer).
	 */
	public applyForce(target: PhysicsBody, factor: number, angle: number): void {
		target.vx += factor * Math.cos(angle);
		target.vy += factor * Math.sin(angle);
	}

	/**
	 * Egen oppdateringsfunksjon for spiller.
	 * Har egendefinerte kraftverdier for å gå til venstre og høyre.
	 */
	private updatePlayer(player: Player): void{
		const step = 10;
		if (this.noclip){
			player.vx = 0;
			player.vy = 0;
			if (player.w) player.y -= step;
			if (player.a) player.x -= step;
			if (player.s) player.y += step;
			if (player.d) player.x += step;
		} else {
			if (player.w && player.vy === 0) {
				this.applyForce(player, 12, -Math.PI / 2)
				this.onjump.call(false);
			}
			if (player.a) this.applyForce(player, 1.5, -Math.PI);
			if (player.d) this.applyForce(player, 1.5, 0);
		}
	}

	/**
	 * Oppdateringsfunksjon for alle fiender.
	 * Farten kommer an på om fienden patruljerer eller jakter spilleren.
	 */
	private updateNPC(npc: NPC): void {
		if(npc.a) {
			this.applyForce(npc, npc.speed, -Math.PI);
		}
		if(npc.d) {
			this.applyForce(npc, npc.speed, 0);
		}
		if(npc.w && npc.vy <= 1e-15 && npc.vy >= -1e-15) {
			this.applyForce(npc, npc.jumpheight, -Math.PI/2);
		}
	}

	/**
	 * Sjekker om to spillobjekter kommer nær hverandre.
	 */
	public touches(object1: GameObject, object2: GameObject): boolean {
		if(!(object1 instanceof Sprite) || !(object2 instanceof Sprite)) return;

		if(object1.right > object2.left && object1.left < object2.right) {
			if(object1.top < object2.bottom && object1.bottom > object2.top) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Egen kollisjons-sjekk for prosjektiler. Gjøres på en annen måte enn for andre spillobjekter.
	 * @param entities Alle spillobjekter.
	 * @param projectiles Alle prosjektiler.
	 * @param level Spillnivået.
	 */
	public checkCollisionProjectiles(entities: InstanceType<typeof GameObject>[], projectiles: InstanceType<typeof Projectile>[], level: Room){
		// Først filtrerer vi ut kun spillobjekter som arver fra NPC (Spiller og fiender).
		let filtered = entities.filter(<(t: GameObject) => t is NPC>(t => t instanceof NPC))

		// Ytre løkke som går igjennom NPC
		for (let n = 0; n < filtered.length; n++){
			// Indre løkke som går igjennom prosjektiler
			for (let p = 0; p < projectiles.length; p++){
				// Hent lengden mellom prosjektil og NPC
				let len = Math.hypot(filtered[n].x - projectiles[p].x, filtered[n].y - projectiles[p].y);
				if (len > THRESHOLD_ACCURATE_PROJECTILE_MODE) continue;
				let targ = filtered[n];
				let proj = projectiles[p];
				// Skyteren kan ikke treffe seg selv.
				if (proj.shooter === targ) continue;                
				
				// Sjekker kollisjon mellom prosjektilen og NPC.
				// Dersom den treffer mister NPC liv, og prosjektilen blir fjernet.
				if (proj.bottom > targ.top && proj.top < targ.bottom){
					if (proj.right > targ.left && proj.left < targ.right){

						this.projectileHit.call(false, targ);

						targ.healthCurrent -= proj.damage;
						targ.healthCurrent = targ.healthCurrent < 0 ? 0 : targ.healthCurrent;

						projectiles.splice(p, 1);
						p--;     
					}
				}
			}
		}

		// Seperat sjekk for om prosjektiler treffer spillverdenen.
		for (let p = 0; p < projectiles.length; p++){
			let proj = projectiles[p];
			// Hent prosjektilens posisjon i spill-grid.
			let gridX = Math.round(proj.x / BLOCKSIZE);
			let gridY = Math.round(proj.y / BLOCKSIZE);

			let grid = level.data;

			// Dersom prosjektilen treffer en blokk, fjerner vi den og spiller av en lyd.
			if (grid[gridY] && grid[gridY][gridX]){                
				if (BLOCKS[grid[gridY][gridX]].solid){                                                            
					if (
						proj.x > gridX * BLOCKSIZE - 0.5 * BLOCKSIZE ||
						proj.x < gridX * BLOCKSIZE + 0.5 * BLOCKSIZE ||
						proj.y > gridY * BLOCKSIZE - 0.5 * BLOCKSIZE ||
						proj.y < gridY * BLOCKSIZE + 0.5 * BLOCKSIZE 
					){                        
						this.projectileHit.call(false, new Block)
						projectiles.splice(p, 1);
						p--;
						continue;
					}
				}
			}
		}
	}
	
	/**
	 * Hjelpefunksjon for å måle drap spilleren har gjort.
	 * Må være i physics engine.
	 * @param entities Alle spillobjekter.
	 */
	private increaseKills(entities: GameObject[]): void {
		entities.forEach(entity => {
			if(entity instanceof Player) entity.kills++;
		});
	}
}
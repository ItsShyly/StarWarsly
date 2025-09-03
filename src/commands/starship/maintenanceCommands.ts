// ^^^ Ship Maintenance Commands ^^^
// vvv Repair, Refuel and Rename Operations vvv

import type { Starship } from "./types.js";

export class MaintenanceCommands {
  // >>> Repair ship damage at a cost of 10 credits per percentage point
  static async repairShip(ship: Starship, args: string[], reply: (msg: string) => void): Promise<void> {
    if (ship.inFlight)
      throw new Error("Reparieren während des Flugs nicht möglich!");

    const percent = parseInt(args[0]) || 10; // <<< Default to 10% if no amount specified
    if (isNaN(percent)) throw new Error("Ungültiger Reparaturbetrag");
    if (ship.damage <= 0) throw new Error("Kein Schaden zum Reparieren!");

    const cost = percent * 10; // <<< 10 credits per percentage point of repair
    if (ship.credits < cost) {
      throw new Error(
        `Benötigt ${cost} credits, um ${percent}% zu reparieren`
      );
    }

    ship.damage = Math.max(0, ship.damage - percent); // <<< Ensure damage doesn't go negative
    ship.credits = Math.round(ship.credits - cost); // <<< Round to whole credits

    reply(
      `🔧 ${percent}% Schaden für ${cost} credits repariert | Schaden: ${ship.damage}%`
    );
  }

  // vvv Fuel Management Operations vvv
  // >>> Refuel ship at a cost of 5 credits per percentage point
  static async refuelShip(ship: Starship, args: string[], reply: (msg: string) => void): Promise<void> {
    if (ship.inFlight)
      throw new Error("Kann während des Fluges nicht auftanken!");
    if (ship.fuel >= 100) throw new Error("Tank ist bereits voll!");

    const percent = parseInt(args[0]) || 10; // <<< Default to 10% if no amount specified
    if (isNaN(percent)) throw new Error("Ungültige Menge");

    const cost = percent * 5; // <<< 5 credits per 1% fuel
    if (ship.credits < cost) {
      throw new Error(`Benötigt ${cost} credits, um ${percent}% aufzutanken`);
    }

    const newFuel = Math.min(100, ship.fuel + percent); // <<< Cap fuel at 100%
    const actualRefueled = newFuel - ship.fuel; // <<< Calculate actual amount refueled

    ship.credits = Math.round(ship.credits - cost);
    ship.fuel = newFuel;

    reply(
      `⛽ ${actualRefueled}% getankt für ${cost} credits | Tank: ${ship.fuel}%`
    );
  }

  // vvv Ship Customization Commands vvv
  // >>> Rename the player's starship
  static async renameShip(ship: Starship, args: string[], reply: (msg: string) => void): Promise<void> {
    const newName = args.join(" ");
    if (!newName) throw new Error("Bitte einen neuen Namen angeben!");
    if (newName.length > 25) throw new Error("Name zu lang! Max 25 Zeichen"); // <<< Enforce name length limit

    ship.name = newName;
    reply(`🆕 Starship renamed to: ${newName}`);
  }
}
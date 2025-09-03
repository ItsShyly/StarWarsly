// ^^^ Cargo Management Commands ^^^

import type { Starship } from "./types.js";
import { CARGO_TYPES } from "./constants.js";
import { ShipUtils } from "./utils.js";

// vvv Cargo Display and Operations vvv
export class CargoCommands {
  // >>> Display ship's current cargo manifest
  static async showCargo(ship: Starship, reply: (msg: string) => void): Promise<void> {
    if (ship.cargo.length === 0) {
      reply("📦 Keine Cargo vorhanden");
      return;
    }

    const cargoList = ship.cargo
      .map((c) => {
        const cargoType = CARGO_TYPES[c.item] || { weight: 1, value: 40 }; // <<< Default values for unknown items
        return `${c.quantity}x ${c.item} (${
          cargoType.weight * c.quantity
        }kg, ${cargoType.value * c.quantity}cr)`;
      })
      .join(" | ");

    reply(`📦 Fracht: ${cargoList} | Gewicht: ${ShipUtils.calculateCargoWeight(ship)}kg`);
  }

  // vvv Cargo Transaction Commands vvv
  // >>> Sell cargo items for credits
  static async sellCargo(ship: Starship, args: string[], reply: (msg: string) => void): Promise<void> {
    if (ship.inFlight)
      throw new Error("Du kannst nicht verkaufen, während du fliegst!");

    const itemName = args.join(" ");
    if (!itemName) throw new Error("Bitte gib die zu verkaufende Fracht an.");

    const cargoItem = ship.cargo.find(
      (c) => c.item.toLowerCase() === itemName.toLowerCase()
    );
    if (!cargoItem) throw new Error(`Keine ${itemName} in der Fracht`);

    const cargoType = CARGO_TYPES[cargoItem.item] || { value: 40 }; // <<< Fallback value for unknown items
    const totalValue = cargoType.value * cargoItem.quantity;

    ship.credits += totalValue;
    ship.credits = Math.round(ship.credits); // <<< Ensure whole number credits
    ShipUtils.removeCargo(ship, cargoItem.item, cargoItem.quantity);

    reply(
      `💰 Sold ${cargoItem.quantity}x ${cargoItem.item} for ${totalValue} credits!`
    );
  }

  // >>> Jettison cargo to reduce weight
  static async jettisonCargo(ship: Starship, args: string[], reply: (msg: string) => void): Promise<void> {
    if (ship.inFlight)
      throw new Error(
        "Du kannst deine Fracht nicht abwerfen, während du fliegst!"
      );

    const itemName = args.join(" ");
    if (!itemName)
      throw new Error("Bitte gib die Fracht an, die du abwerfen möchtest.");

    const cargoItem = ship.cargo.find(
      (c) => c.item.toLowerCase() === itemName.toLowerCase()
    );
    if (!cargoItem) throw new Error(`Keine ${itemName} in der Fracht`);

    const quantity = parseInt(args[1]) || cargoItem.quantity; // <<< Use specified quantity or all
    if (quantity > cargoItem.quantity)
      throw new Error(`Only have ${cargoItem.quantity}x ${cargoItem.item}`);

    ShipUtils.removeCargo(ship, cargoItem.item, quantity);

    reply(
      `🗑️ ${quantity}x ${cargoItem.item} abgeworfen! Geschwindigkeit erhöht.`
    );
  }
}
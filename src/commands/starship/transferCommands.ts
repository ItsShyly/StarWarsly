// ^^^ Credit Transfer Commands ^^^
// vvv Inter-Player Credit Transactions vvv

import type { Starship } from "./types.js";
import { StarshipDatabase } from "./StarshipDatabase.js";

export class TransferCommands {
  // >>> Transfer credits between players on the same planet
  static async transferCredits(
    senderShip: Starship,
    targetUser: string,
    amount: number,
    starshipDB: StarshipDatabase,
    reply: (msg: string) => void
  ): Promise<void> {
    // >>> Validation checks
    if (amount <= 0) {
      throw new Error("Transferbetrag muss positiv sein!");
    }
    
    if (senderShip.credits < amount) {
      throw new Error(`Du hast nicht genug Credits! (${senderShip.credits} verfügbar)`);
    }
    
    if (senderShip.inFlight) {
      throw new Error("Während des Fluges können keine Credits transferiert werden!");
    }
    
    // >>> Get target ship
    const targetShip = await starshipDB.get(targetUser.toLowerCase()); // <<< Case-insensitive lookup
    if (!targetShip) {
      throw new Error(`Spieler ${targetUser} wurde nicht gefunden oder hat kein Starship!`);
    }
    
    if (targetShip.inFlight) {
      throw new Error(`${targetUser} ist derzeit im Flug - Transfer nicht möglich!`);
    }
    
    // >>> Check if both players are on the same planet
    if (senderShip.location !== targetShip.location) {
      throw new Error(
        `Transfer fehlgeschlagen! Du bist auf ${senderShip.location}, aber ${targetUser} ist auf ${targetShip.location}. ` +
        "Ihr müsst auf demselben Planeten sein für einen Credit-Transfer." // <<< Location-based restriction
      );
    }
    
    // >>> Perform the transfer
    senderShip.credits = Math.round(senderShip.credits - amount); // <<< Round to prevent fractional credits
    targetShip.credits = Math.round(targetShip.credits + amount); // <<< Round to prevent fractional credits
    
    // >>> Save both ships
    await starshipDB.save(targetUser.toLowerCase(), targetShip); // <<< Persist changes to database
    
    reply(
      `💸 ${amount} Credits erfolgreich an ${targetUser} transferiert! ` +
      `(${senderShip.credits} Credits verbleibend) | Standort: ${senderShip.location}`
    );
  }
}
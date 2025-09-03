// ^^^ Status and Help Commands ^^^
// vvv Ship Status Display and Help Information vvv

import type { Starship } from "./types.js";
import { ShipUtils } from "./utils.js";

export class StatusCommands {
  // >>> Display comprehensive ship status information
  static async showStatus(ship: Starship, reply: (msg: string) => void): Promise<void> {
    ShipUtils.updateShipSpeed(ship); // <<< Ensure current speed is calculated

    let statusMsg = [
      `🚀 ${ship.name}`,
      `⚡ ${ship.currentSpeed.toFixed(1)} ly/h | 🔋 ${ship.fuel}%`, // <<< Speed formatted to 1 decimal
      `💰 ${ship.credits} cr | 🔧 ${ship.damage}% dmg`,
      `📦 ${ShipUtils.calculateCargoWeight(ship)} kg | 🌍 ${ship.location}`,
      `🛣️ ${ship.distance.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Lichtjahre zurückgelegt`, // <<< German number formatting
    ];

    if (ship.inFlight) {
      const remainingSeconds = Math.max(
        0,
        (ship.inFlight.arrivalTime - Date.now()) / 1000
      );
      const originalTime =
        (ship.inFlight.baseArrivalTime - ship.inFlight.departureTime) /
        1000;
      const timeSaved = originalTime - remainingSeconds; // <<< Calculate time saved from hyperspace

      statusMsg.push(
        `✈️ Unterwegs nach ${
          ship.inFlight.destination
        } | Ankunft in: ${ShipUtils.formatTime(remainingSeconds)}`
      );

      if (timeSaved > 0) {
        statusMsg.push(
          `💨 Hyperspace boost hat ${ShipUtils.formatTime(timeSaved)} gespart`
        );
      }
    }

    reply(statusMsg.join(" | "));
  }

  // vvv Help Information Commands vvv
  // >>> Display available commands and their usage
  static async showHelp(reply: (msg: string) => void): Promise<void> {
    const helpMessage = [
      "🚀 #starship Kommandokonsole:",
      "help → Diese Info",
      "name <neuer_Name> → Namechange",
      "fly <Planet|Optional> → Fliegen",
      "land → Landen",
      "explore <betrag> → Erkunden (investitionsbasiert)",
      "cargo → Frachtinfo",
      "sell <Item> → Verkaufen",
      "jettison <Item> [Anzahl] → Abwerfen",
      "refuel [%] →  Tanken (-5cr/1%)",
      "repair [%] → Reparatur (-10cr/1%)",
      "hyperspace → Speed Boost (-1000cr)",
      "transfer/give <player> <amount> → Credits übertragen",
      "leaderboard/lb → Bestenliste anzeigen",
      "explore help → Erkundungsdetails"
    ].join(" | ");

    reply(helpMessage);
  }
}
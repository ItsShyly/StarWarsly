// ^^^ StarWarsly Starship Commands - Flight Operations ^^^

// >>> This module handles all flight-related commands including navigation,
// >>> hyperspace boosts, and arrival processing. Manages ship movement between
// >>> planets with proper fuel consumption and travel time calculations.

// vvv Dependencies vvv
import type { Starship } from "./types.js";
import { ShipUtils } from "./utils.js";

// vvv Flight Operations vvv
export class FlightCommands {
  // >>> Flight navigation and hyperspace control
  static async flyToLocation(
    ship: Starship, 
    args: string[], 
    reply: (msg: string) => void,
    channel: string,
    displayName: string
  ): Promise<void> {
    // >>> Validate ship conditions before flight
    if (ship.damage >= 90)
      throw new Error("Raumschiff zu beschädigt! Zuerst reparieren");
    if (ship.fuel < 10) throw new Error("Nicht genug Treibstoff!");
    
    // >>> Prevent double flight commands
    if (ship.inFlight) {
      const remainingSeconds = Math.max(
        0,
        (ship.inFlight.arrivalTime - Date.now()) / 1000
      );
      throw new Error(
        `Bereits unterwegs nach ${
          ship.inFlight.destination
        }! Ankunft in: ${ShipUtils.formatTime(remainingSeconds)}`
      );
    }

    // vvv Destination Processing vvv
    let destination: string | undefined;
    const planetNames = ShipUtils.getPlanetNames();

    if (args.length > 0) {
      const userInput = args.join(" ");
      destination = planetNames.find(
        (p) => p.toLowerCase() === userInput.toLowerCase()
      );
      if (!destination) {
        throw new Error(
          `Planet nicht gefunden: ${userInput}... Ich könnte zu einem zufälligen Planeten fliegen, wenn du mir keine Anweisungen gibst.`
        );
      }
    } else {
      // >>> Pick random destination when none specified
      let randomPlanet = ship.location;
      while (randomPlanet === ship.location) {
        randomPlanet =
          planetNames[Math.floor(Math.random() * planetNames.length)];
      }
      destination = randomPlanet;
    }

    // vvv Navigation Calculations vvv
    const distance = ShipUtils.calculateDistance(ship.location, destination);
    if (distance < 0.1) throw new Error("Da sind wir doch schon");

    // >>> Calculate time-to-arrival based on speed
    const travelTimeSeconds = (distance / ship.currentSpeed) * 3600;
    const departureTime = Date.now();
    const arrivalTime = departureTime + travelTimeSeconds * 1000;

    // >>> Consume fuel for the journey
    ship.fuel -= 10;

    // vvv Daily Reward System vvv
    const today = ShipUtils.getToday();
    if (ship.lastFlightDate !== today) {
      const bonus = Math.floor(100 + Math.random() * 150);
      ship.credits += bonus;
      ship.credits = Math.round(ship.credits);
      ship.lastFlightDate = today;
      reply(`✨ Daily flight bonus! +${bonus} credits`);
    }

    // >>> Store flight data for async completion
    ship.inFlight = {
      destination,
      departureTime,
      arrivalTime,
      distance,
      baseArrivalTime: arrivalTime,
      channel,
    };

    reply(
      `🚀 Kurs gesetzt auf ${destination}... Entfernung: ${distance.toLocaleString('de-DE', {
        maximumFractionDigits: 2
      })} Lichtjahre | Geschätzte Ankunft in: ${ShipUtils.formatTime(
        travelTimeSeconds
      )} — droid`
    );
  }

  // vvv Hyperspace Boost Function vvv
  static async hyperspaceBoost(ship: Starship, reply: (msg: string) => void): Promise<void> {
    // >>> Check if ship is actually in flight
    if (!ship.inFlight)
      throw new Error("Noch am Fliegen! Warte auf Ankunft...");

    const boostCost = 1000.0;
    if (ship.credits < boostCost) {
      throw new Error(
        `Brauche ${boostCost} credits für den Hyperspace-Boost`
      );
    }

    // vvv Speed Boost Calculations vvv
    // >>> Get progress ratio for partial boost
    const elapsed = (Date.now() - ship.inFlight.departureTime) / 1000;
    const totalTime =
      (ship.inFlight.arrivalTime - ship.inFlight.departureTime) / 1000;
    const remainingFraction = 1 - elapsed / totalTime;

    // >>> Apply fixed speed increment
    const speedBoost = 0.25;
    const newSpeed = ship.currentSpeed + speedBoost;

    // >>> Recalculate arrival with boosted speed
    const remainingDistance = ship.inFlight.distance * remainingFraction;
    const newTravelTime = (remainingDistance / newSpeed) * 3600;
    const newArrivalTime = Date.now() + newTravelTime * 1000;

    // >>> Update ship state with boost effects
    ship.inFlight.arrivalTime = newArrivalTime;
    ship.currentSpeed = newSpeed;
    ship.credits -= boostCost;
    ship.credits = Math.round(ship.credits);

    reply(
      `💨 Hyperspace boost aktiviert! Speed: ${newSpeed.toFixed(
        1
      )} ly/h | gespart ${ShipUtils.formatTime(
        totalTime - elapsed - newTravelTime
      )} | Kosten: ${boostCost} credits`
    );
  }

  // vvv Flight Completion Handler vvv
  static async checkFlightCompletion(
    ship: Starship, 
    bot: any, 
    displayName: string
  ): Promise<boolean> {
    // >>> Check if journey is complete and handle arrival
    if (ship.inFlight && Date.now() >= ship.inFlight.arrivalTime) {
      const distance = ship.inFlight.distance;
      ship.distance += distance;
      ship.location = ship.inFlight.destination;
      ship.canLand = true;
      ship.exploreCount = 0;
      ship.hasLanded = false;
      ship.hasExploredThisLanding = false;

      // >>> Notify player of successful arrival
      bot.say(
        ship.inFlight.channel,
        `@${displayName} ✅ Angekommen in ${ship.inFlight.destination}! ` +
          `Distanz zurückgelegt: ${distance.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Lichtjahre | ` +
          `Insgesamt: ${ship.distance.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Lichtjahre | ` +
          `Tank: ${ship.fuel}%`
      );

      delete ship.inFlight;
      return true;
    }
    return false;
  }
}

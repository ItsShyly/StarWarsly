// ^^^ Starship Utilities - Core Ship Operations ^^^

// >>> Provides utility functions for ship management including cargo handling,
// >>> speed calculations, distance measurements, and functional item processing.
// >>> Central logic for ship state modifications and game mechanics.

// vvv Module Dependencies vvv
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { PlanetCoords, Starship, GameEvent } from "./types.js";
import { LIGHT_YEAR_TO_KM, HYPERSPACE_MULTIPLIER, CARGO_TYPES } from "./constants.js";

// vvv Path Resolution vvv
// >>> Get current module directory for file loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// vvv Galaxy Map Data vvv
// >>> Load planet coordinates for distance calculations
const planetCoordsPath = path.resolve(__dirname, "../../../planetCoords.json");
const PLANET_COORDS: Record<string, PlanetCoords> = JSON.parse(
  fs.readFileSync(planetCoordsPath, "utf-8")
);

// vvv Ship Operations Utilities vvv
export class ShipUtils {
  // vvv Cargo Weight Calculator vvv
  static calculateCargoWeight(ship: Starship): number {
    // >>> Sum all cargo weights for speed penalty
    return ship.cargo.reduce((total, cargo) => {
      const cargoType = CARGO_TYPES[cargo.item] || { weight: 1, value: 40 };
      return total + cargo.quantity * cargoType.weight;
    }, 0);
  }

  // vvv Speed Modifier System vvv
  static updateShipSpeed(ship: Starship): void {
    const cargoWeight = this.calculateCargoWeight(ship);
    
    // vvv Weight Penalty Thresholds vvv
    // >>> Apply progressive speed reduction based on cargo load
    // >>> Light cargo (0-100kg): No penalty
    // >>> Medium cargo (100-300kg): Linear penalty 2 ly/h per kg  
    // >>> Heavy cargo (300kg+): Exponential penalty
    let speedPenalty = 0;
    
    if (cargoWeight > 100) {
      const lightOverage = Math.min(cargoWeight - 100, 200); // <<< Up to 200kg medium penalty
      speedPenalty += lightOverage * 2; // <<< 2 ly/h per kg
      
      if (cargoWeight > 300) {
        const heavyOverage = cargoWeight - 300;
        speedPenalty += heavyOverage * 5; // <<< 5 ly/h per kg for very heavy cargo
      }
    }
    
    // >>> Apply item bonuses and enforce minimum speed
    const speedBonus = this.calculateFunctionalBonus(ship, 'speed_booster');
    
    // >>> Ensure minimum playable speed of 100 ly/h
    ship.currentSpeed = Math.max(100, ship.baseSpeed - speedPenalty + speedBonus);
  }

  // vvv Cargo Addition Handler vvv
  static addCargo(ship: Starship, item: string, quantity: number): void {
    // >>> Stack items of same type or create new entry
    const existing = ship.cargo.find((c) => c.item === item);
    if (existing) {
      existing.quantity += quantity;
    } else {
      ship.cargo.push({ item, quantity });
    }
    this.updateShipSpeed(ship);
  }

  // vvv Cargo Removal Handler vvv
  static removeCargo(ship: Starship, item: string, quantity: number): boolean {
    // >>> Remove items and clean up empty slots
    const cargoIndex = ship.cargo.findIndex((c) => c.item === item);
    if (cargoIndex === -1) return false;

    if (ship.cargo[cargoIndex].quantity > quantity) {
      ship.cargo[cargoIndex].quantity -= quantity;
    } else {
      ship.cargo.splice(cargoIndex, 1);
    }

    this.updateShipSpeed(ship);
    return true;
  }

  // vvv Interstellar Distance Calculator vvv
  static calculateDistance(planet1: string, planet2: string): number {
    const p1 = PLANET_COORDS[planet1];
    const p2 = PLANET_COORDS[planet2];

    if (!p1 || !p2) return 0;

    // >>> 3D Euclidean distance formula
    const rawDistance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2)
    );

    // >>> Scale to realistic light-year distances
    return (
      ((100 + rawDistance * 0.1) * 1000 * HYPERSPACE_MULTIPLIER) /
      LIGHT_YEAR_TO_KM
    );
  }

  // vvv Time Display Formatter vvv
  static formatTime(seconds: number): string {
    // >>> Convert seconds to German time units
    if (seconds < 60) {
      return `${Math.round(seconds)} Sekunden`;
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    if (mins < 60) {
      return `${mins} Minute${mins !== 1 ? "n" : ""}${
        secs > 0 ? ` und ${secs} Sekunde${secs !== 1 ? "n" : ""}` : ""
      }`;
    }

    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    return `${hrs} Stunde${hrs !== 1 ? "n" : ""}${
      remainingMins > 0
        ? ` und ${remainingMins} Minute${remainingMins !== 1 ? "n" : ""}`
        : ""
    }`;
  }


  // vvv Date Helper vvv
  static getToday(): string {
    // >>> ISO date for daily bonus tracking
    return new Date().toISOString().split("T")[0];
  }

  // vvv Event Effect Processor vvv
  static applyEvent(ship: Starship, event: GameEvent, reply: (msg: string) => void): void {
    // >>> Modify ship state based on event outcomes
    if (event.damage)
      ship.damage = Math.min(100, Math.max(0, ship.damage + event.damage));
    if (event.fuel)
      ship.fuel = Math.min(100, Math.max(0, ship.fuel + event.fuel));
    if (event.credits) {
      ship.credits = Math.round(ship.credits + event.credits);
    }
    if (event.addCargo)
      this.addCargo(ship, event.addCargo.item, event.addCargo.quantity);

    if (event.removeCargo && ship.cargo.length > 0) {
      const randomIndex = Math.floor(Math.random() * ship.cargo.length);
      const randomItem = ship.cargo[randomIndex].item;
      const removed = this.removeCargo(ship, randomItem, 1);
      if (removed) reply(`❗ 1x ${randomItem} verloren!`);
    }
  }

  // vvv Credit Management Functions vvv
  // >>> Prevent floating point errors in currency
  static roundCredits(ship: Starship): void {
    ship.credits = Math.round(ship.credits);
  }

  // >>> Safe credit addition
  static addCredits(ship: Starship, amount: number): void {
    ship.credits = Math.round(ship.credits + amount);
  }

  // >>> Safe credit subtraction
  static subtractCredits(ship: Starship, amount: number): void {
    ship.credits = Math.round(ship.credits - amount);
  }

  // vvv Galaxy Data Access vvv
  static getPlanetNames(): string[] {
    // >>> Return all available destinations
    return Object.keys(PLANET_COORDS);
  }

  // vvv Item Bonus Calculator vvv
  static calculateFunctionalBonus(ship: Starship, type: 'fuel_generator' | 'credit_generator' | 'speed_booster' | 'repair_droid'): number {
    // >>> Sum bonuses from functional cargo items
    let total = 0;
    ship.cargo.forEach(cargo => {
      const cargoType = CARGO_TYPES[cargo.item];
      if (cargoType?.functional?.type === type) {
        total += cargoType.functional.effect * cargo.quantity;
      }
    });
    return total;
  }

  // vvv Periodic Item Effect Processor vvv
  static updateFunctionalItems(ship: Starship): { messages: string[] } {
    // >>> Apply hourly effects from functional items
    const now = Date.now();
    const lastUpdate = ship.lastItemUpdate || now;
    const hoursPassed = (now - lastUpdate) / (1000 * 60 * 60);
    
    // >>> Prevent updates more frequent than hourly
    if (hoursPassed < 1) {
      return { messages: [] };
    }
    
    const messages: string[] = [];
    const consumedItems: { item: string; quantity: number }[] = [];
    
    // vvv Fuel Generation Process vvv
    const fuelGen = this.calculateFunctionalBonus(ship, 'fuel_generator');
    if (fuelGen > 0) {
      const fuelGained = Math.min(100 - ship.fuel, Math.floor(fuelGen * hoursPassed));
      if (fuelGained > 0) {
        ship.fuel += fuelGained;
        messages.push(`⚡ Functional items generated ${fuelGained}% fuel`);
      }
    }
    
    // vvv Credit Generation Process vvv
    const creditGen = this.calculateFunctionalBonus(ship, 'credit_generator');
    if (creditGen > 0) {
      const creditsGained = Math.floor(creditGen * hoursPassed);
      ship.credits = Math.round(ship.credits + creditsGained);
      messages.push(`💰 Functional items generated ${creditsGained} credits`);
    }
    
    // vvv Auto-Repair Process vvv  
    const repair = this.calculateFunctionalBonus(ship, 'repair_droid');
    if (repair > 0 && ship.damage > 0) {
      const damageRepaired = Math.min(ship.damage, Math.floor(repair * hoursPassed));
      ship.damage -= damageRepaired;
      messages.push(`🔧 Repair droids fixed ${damageRepaired}% damage`);
    }
    
    // vvv Consumable Item Depletion vvv
    // >>> Remove items that expire over time
    ship.cargo = ship.cargo.filter(cargo => {
      const cargoType = CARGO_TYPES[cargo.item];
      if (cargoType?.functional?.duration) {
        // >>> Consumable item handling
        const hoursConsumed = Math.min(cargo.quantity, Math.floor(hoursPassed / cargoType.functional.duration));
        if (hoursConsumed > 0) {
          consumedItems.push({ item: cargo.item, quantity: hoursConsumed });
          cargo.quantity -= hoursConsumed;
          return cargo.quantity > 0;
        }
      }
      return true;
    });
    
    // >>> Notify player of consumed items
    consumedItems.forEach(consumed => {
      messages.push(`🗑️ ${consumed.quantity}x ${consumed.item} consumed after use`);
    });
    
    ship.lastItemUpdate = now;
    this.updateShipSpeed(ship); // <<< Recalculate speed after cargo changes
    
    return { messages };
  }
}

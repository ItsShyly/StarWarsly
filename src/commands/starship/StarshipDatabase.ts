// ^^^ Starship Database Layer ^^^

// >>> This now acts as a wrapper around the GlobalDatabase
// >>> Provides backward compatibility while using the new centralized system
// >>> Credits are managed globally, starship data is module-specific

import { GlobalDatabase } from "../../database/GlobalDatabase.js";
import type { Starship, StarshipRow } from "./types.js";

// vvv Starship Database Handler vvv
export class StarshipDatabase {
  private globalDb: GlobalDatabase;

  constructor() {
    // >>> Use the centralized database system
    this.globalDb = GlobalDatabase.getInstance();
    console.log("🚀 StarshipDatabase initialized with centralized system");
  }

  // ^^^ Ship Data Retrieval ^^^
  async get(user: string): Promise<Starship | null> {
    // >>> Get starship data from centralized database
    const starship = await this.globalDb.getStarship(user);
    
    if (!starship) {
      return null;
    }

    // >>> Sync credits with global player credits
    const playerCredits = await this.globalDb.getPlayerCredits(user);
    starship.credits = playerCredits;
    
    return starship;
  }

  // ^^^ Ship Data Persistence ^^^
  async save(user: string, ship: Starship): Promise<void> {
    // >>> Handle credit changes
    const currentCredits = await this.globalDb.getPlayerCredits(user);
    const creditDifference = ship.credits - currentCredits;
    
    if (creditDifference !== 0) {
      // >>> Update global credits if they changed
      await this.globalDb.updatePlayerCredits(user, creditDifference);
    }
    
    // >>> Save starship data (without credits, managed globally)
    await this.globalDb.saveStarship(user, ship);
  }

  // ^^^ Ship Removal Handler ^^^
  async delete(user: string): Promise<void> {
    // >>> Remove starship data but keep player data
    await this.globalDb.deleteStarship(user);
  }

  // ^^^ Active Flight Tracker ^^^
  async getAllInFlight(): Promise<{ user: string; inFlight: Starship["inFlight"] }[]> {
    // >>> Get all ships currently in flight
    const results = await this.globalDb.getStarshipsInFlight();
    
    // >>> Convert username back to user for backward compatibility
    return results.map(result => ({
      user: result.username,
      inFlight: result.inFlight
    }));
  }

  // ^^^ Ranking System Query ^^^
  async getLeaderboard(limit: number = 10): Promise<{ user: string; name: string; distance: number; location: string }[]> {
    // >>> Get leaderboard from centralized database
    const results = await this.globalDb.getStarshipLeaderboard(limit);
    
    // >>> Convert username back to user for backward compatibility
    return results.map(result => ({
      user: result.username,
      name: result.name,
      distance: result.distance,
      location: result.location
    }));
  }

  // ^^^ Database Connection Cleanup ^^^
  close() {
    // >>> Database connection managed by GlobalDatabase singleton
    console.log("StarshipDatabase: Connection managed by GlobalDatabase");
  }

  // ^^^ Additional Utilities ^^^
  
  // >>> Get player credits (convenience method)
  async getPlayerCredits(user: string): Promise<number> {
    return await this.globalDb.getPlayerCredits(user);
  }

  // >>> Update player credits (convenience method)
  async updatePlayerCredits(user: string, amount: number): Promise<void> {
    await this.globalDb.updatePlayerCredits(user, amount);
  }

  // >>> Spend credits with validation (convenience method)
  async spendCredits(user: string, amount: number): Promise<boolean> {
    return await this.globalDb.spendCredits(user, amount);
  }

  // >>> Add credits (convenience method)
  async addCredits(user: string, amount: number): Promise<void> {
    await this.globalDb.addCredits(user, amount);
  }
}

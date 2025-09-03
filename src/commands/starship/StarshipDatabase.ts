// ^^^ Starship Database Layer ^^^

// vvv Database Dependencies vvv
import sqlite3 from "sqlite3";
const { Database } = sqlite3;
import type { Starship, StarshipRow } from "./types.js";

// vvv Persistent Storage Handler vvv
export class StarshipDatabase {
  private db: sqlite3.Database;

  constructor() {
    // >>> This creates or opens the SQLite database
    this.db = new Database("./storage/starships.db");
    this.initializeDatabase();
  }

  // ^^^ Database Schema Setup ^^^
  private initializeDatabase() {
    // >>> Create main starships table if not exists
    this.db.run(`
      CREATE TABLE IF NOT EXISTS starships (
        user TEXT PRIMARY KEY,
        name TEXT,
        baseSpeed REAL,
        currentSpeed REAL,
        fuel INTEGER,
        credits INTEGER,
        damage INTEGER,
        cargo TEXT,
        location TEXT,
        distance REAL,
        lastFlightDate TEXT,
        inFlight TEXT,
        canLand INTEGER,
        exploreCount INTEGER,
        hasLanded INTEGER
      )
    `);

    // vvv Schema Migration Handlers vvv
    // >>> This safely adds columns for backwards compatibility
    this.db.run(
      "ALTER TABLE starships ADD COLUMN canLand INTEGER DEFAULT 1",
      (err) => {}
    );
    this.db.run(
      "ALTER TABLE starships ADD COLUMN exploreCount INTEGER DEFAULT 0",
      (err) => {}
    );
    this.db.run(
      "ALTER TABLE starships ADD COLUMN hasLanded INTEGER DEFAULT 0",
      (err) => {}
    );
    this.db.run(
      "ALTER TABLE starships ADD COLUMN hasExploredThisLanding INTEGER DEFAULT 0",
      (err) => {}
    );
    this.db.run(
      "ALTER TABLE starships ADD COLUMN lastItemUpdate INTEGER DEFAULT 0",
      (err) => {}
    );
  }

  // ^^^ Ship Data Retrieval ^^^
  get(user: string): Promise<Starship | null> {
    // >>> Fetch player's ship from database
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM starships WHERE user = ?",
        [user],
        (err: Error | null, row: StarshipRow | undefined) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          try {
            resolve({
              name: row.name,
              baseSpeed: row.baseSpeed,
              currentSpeed: row.currentSpeed,
              fuel: row.fuel,
              credits: Math.round(row.credits), // <<< ensures integer credits
              damage: row.damage,
              cargo: JSON.parse(row.cargo),
              location: row.location,
              distance: row.distance,
              lastFlightDate: row.lastFlightDate,
              inFlight: row.inFlight ? JSON.parse(row.inFlight) : undefined,
              canLand: row.canLand !== undefined ? Boolean(row.canLand) : true,
              exploreCount: row.exploreCount || 0,
              hasLanded:
                row.hasLanded !== undefined ? Boolean(row.hasLanded) : false,
              hasExploredThisLanding:
                row.hasExploredThisLanding !== undefined ? Boolean(row.hasExploredThisLanding) : false,
              lastItemUpdate: row.lastItemUpdate || 0,
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  // ^^^ Ship Data Persistence ^^^
  save(user: string, ship: Starship): Promise<void> {
    // >>> Store or update ship state in database
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO starships (
          user, name, baseSpeed, currentSpeed, fuel, credits, damage, 
          cargo, location, distance, lastFlightDate, inFlight, canLand, exploreCount, hasLanded, hasExploredThisLanding, lastItemUpdate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user,
          ship.name,
          ship.baseSpeed,
          ship.currentSpeed,
          ship.fuel,
          Math.round(ship.credits), // <<< This prevents floating point errors
          ship.damage,
          JSON.stringify(ship.cargo),
          ship.location,
          ship.distance,
          ship.lastFlightDate || null,
          ship.inFlight ? JSON.stringify(ship.inFlight) : null,
          ship.canLand ? 1 : 0,
          ship.exploreCount,
          ship.hasLanded ? 1 : 0,
          ship.hasExploredThisLanding ? 1 : 0,
          ship.lastItemUpdate || 0,
        ],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ^^^ Ship Removal Handler ^^^
  delete(user: string): Promise<void> {
    // >>> This removes ship when destroyed or reset
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM starships WHERE user = ?",
        [user],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ^^^ Active Flight Tracker ^^^
  getAllInFlight(): Promise<
    { user: string; inFlight: Starship["inFlight"] }[]
  > {
    // >>> Get all ships currently in flight for background checks
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT user, inFlight FROM starships WHERE inFlight IS NOT NULL",
        (err: Error | null, rows: StarshipRow[]) => {
          if (err) return reject(err);

          const results: { user: string; inFlight: Starship["inFlight"] }[] =
            [];
          for (const row of rows) {
            try {
              if (row.inFlight) {
                results.push({
                  user: row.user,
                  inFlight: JSON.parse(row.inFlight),
                });
              }
            } catch (e) {
              console.error("Error parsing in-flight data:", e);
            }
          }
          resolve(results);
        }
      );
    });
  }

  // ^^^ Ranking System Query ^^^
  getLeaderboard(limit: number = 10): Promise<{ user: string; name: string; distance: number; location: string }[]> {
    // >>> This fetches top players by distance traveled
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT user, name, distance, location FROM starships ORDER BY distance DESC LIMIT ?",
        [limit],
        (err: Error | null, rows: StarshipRow[]) => {
          if (err) return reject(err);
          
          const results = rows.map(row => ({
            user: row.user,
            name: row.name,
            distance: row.distance,
            location: row.location
          }));
          resolve(results);
        }
      );
    });
  }

  // ^^^ Database Connection Cleanup ^^^
  close() {
    // >>> This properly closes database connection
    this.db.close();
  }
}

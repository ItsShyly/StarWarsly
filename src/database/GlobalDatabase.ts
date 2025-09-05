// ^^^ Global Game Database ^^^

import sqlite3 from "sqlite3";
const { Database } = sqlite3;
import type { Starship, StarshipRow } from "../commands/starship/types.js";

export interface GlobalPlayer {
  username: string;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  lastActive: number;
  currentContext?: string;
  contextData?: any;
}

interface GlobalPlayerRow {
  username: string;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  lastActive: number;
  currentContext?: string;
  contextData?: string;
}

export class GlobalDatabase {
  private db: sqlite3.Database | null = null;
  private static instance: GlobalDatabase | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private static isInitializing: boolean = false;
  private static readonly DATABASE_PATH = "./storage/globalGameData.db";

  private constructor() {
    // >>> Private constructor for singleton
  }

  static getInstance(): GlobalDatabase {
    if (!GlobalDatabase.instance && !GlobalDatabase.isInitializing) {
      GlobalDatabase.isInitializing = true;
      GlobalDatabase.instance = new GlobalDatabase();
      
      // >>> Only log on first creation
      console.log('🗄️ GlobalDatabase singleton instance created');
    }
    return GlobalDatabase.instance!;
  }

  private async ensureConnection(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    if (this.db && this.isInitialized) {
      return; // <<< Already connected and initialized
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        this.db = new Database(GlobalDatabase.DATABASE_PATH, (err) => {
          if (err) {
            console.error('❌ Failed to open GlobalDatabase:', err);
            this.initPromise = null;
            reject(err);
            return;
          }
          
          this.initializeDatabase().then(() => {
            if (!this.isInitialized) {
              this.isInitialized = true;
              console.log('✅ GlobalDatabase initialized successfully');
            }
            this.initPromise = null;
            resolve();
          }).catch((initErr) => {
            console.error('❌ Failed to initialize GlobalDatabase:', initErr);
            this.initPromise = null;
            reject(initErr);
          });
        });
      } catch (error) {
        console.error('❌ Error creating database:', error);
        this.initPromise = null;
        reject(error);
      }
    });

    return this.initPromise;
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database connection not established'));
        return;
      }

      let completedOperations = 0;
      const totalOperations = 2;
      
      const checkCompletion = () => {
        completedOperations++;
        if (completedOperations >= totalOperations) {
          this.runMigrations().then(() => {
            resolve();
          }).catch(reject);
        }
      };

      // >>> Global player data table
      this.db!.run(`
        CREATE TABLE IF NOT EXISTS players (
          username TEXT PRIMARY KEY,
          credits INTEGER DEFAULT 100,
          totalEarned INTEGER DEFAULT 100,
          totalSpent INTEGER DEFAULT 0,
          lastActive INTEGER,
          currentContext TEXT,
          contextData TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else checkCompletion();
      });

      // >>> Starship-specific data table
      this.db!.run(`
        CREATE TABLE IF NOT EXISTS starships (
          username TEXT PRIMARY KEY,
          name TEXT,
          baseSpeed REAL,
          currentSpeed REAL,
          fuel INTEGER,
          damage INTEGER,
          cargo TEXT,
          location TEXT,
          distance REAL,
          lastFlightDate TEXT,
          inFlight TEXT,
          canLand INTEGER DEFAULT 1,
          exploreCount INTEGER DEFAULT 0,
          hasLanded INTEGER DEFAULT 0,
          hasExploredThisLanding INTEGER DEFAULT 0,
          lastItemUpdate INTEGER DEFAULT 0,
          FOREIGN KEY (username) REFERENCES players (username)
        )
      `, (err) => {
        if (err) reject(err);
        else checkCompletion();
      });
    });
  }

  private async runMigrations(): Promise<void> {
    return new Promise((resolve) => {
      const migrations = [
        "ALTER TABLE starships ADD COLUMN canLand INTEGER DEFAULT 1",
        "ALTER TABLE starships ADD COLUMN exploreCount INTEGER DEFAULT 0", 
        "ALTER TABLE starships ADD COLUMN hasLanded INTEGER DEFAULT 0",
        "ALTER TABLE starships ADD COLUMN hasExploredThisLanding INTEGER DEFAULT 0",
        "ALTER TABLE starships ADD COLUMN lastItemUpdate INTEGER DEFAULT 0"
      ];

      let completed = 0;
      const checkMigrationCompletion = () => {
        completed++;
        if (completed >= migrations.length) {
          resolve();
        }
      };

      if (migrations.length === 0) {
        resolve();
        return;
      }

      migrations.forEach(migration => {
        this.db!.run(migration, () => {
          // >>> Silently ignore errors for existing columns
          checkMigrationCompletion();
        });
      });
    });
  }

  // >>> Player Management
  async getPlayer(username: string): Promise<GlobalPlayer> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error(`Database connection failed for getPlayer(${username}):`, error);
      throw new Error('Database connection failed');
    }

    return new Promise((resolve, reject) => {
      this.db!.get(
        "SELECT * FROM players WHERE username = ?",
        [username],
        (err: Error | null, row: GlobalPlayerRow | undefined) => {
          if (err) {
            console.error(`Error fetching player ${username}:`, err);
            return reject(new Error(`Failed to fetch player data: ${err.message}`));
          }
          
          if (!row) {
            // >>> Create new player with default values
            const newPlayer: GlobalPlayer = {
              username,
              credits: 100,
              totalEarned: 100,
              totalSpent: 0,
              lastActive: Date.now(),
              currentContext: undefined,
              contextData: undefined
            };
            
            this.savePlayer(newPlayer).then(() => {
              console.log(`✅ Created new player: ${username}`);
              resolve(newPlayer);
            }).catch((saveErr) => {
              console.error(`Failed to save new player ${username}:`, saveErr);
              reject(saveErr);
            });
            return;
          }

          // >>> Return existing player data
          resolve({
            username: row.username,
            credits: row.credits,
            totalEarned: row.totalEarned,
            totalSpent: row.totalSpent,
            lastActive: row.lastActive,
            currentContext: row.currentContext,
            contextData: row.contextData ? JSON.parse(row.contextData) : undefined
          });
        }
      );
    });
  }

  async savePlayer(player: GlobalPlayer): Promise<void> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error(`Database connection failed for savePlayer(${player.username}):`, error);
      throw new Error('Database connection failed');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(
        `INSERT OR REPLACE INTO players (
          username, credits, totalEarned, totalSpent, lastActive, currentContext, contextData
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          player.username,
          Math.round(player.credits),
          Math.round(player.totalEarned),
          Math.round(player.totalSpent),
          player.lastActive,
          player.currentContext || null,
          player.contextData ? JSON.stringify(player.contextData) : null
        ],
        (err: Error | null) => {
          if (err) {
            console.error(`Error saving player ${player.username}:`, err);
            reject(new Error(`Failed to save player: ${err.message}`));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updatePlayerCredits(username: string, creditsChange: number): Promise<GlobalPlayer> {
    const player = await this.getPlayer(username);
    
    player.credits += creditsChange;
    player.lastActive = Date.now();
    
    if (creditsChange > 0) {
      player.totalEarned += creditsChange;
    } else {
      player.totalSpent += Math.abs(creditsChange);
    }
    
    await this.savePlayer(player);
    console.log(`💰 ${username}: Credits changed by ${creditsChange}, new balance: ${player.credits}`);
    return player;
  }

  // >>> Starship Management
  async getStarship(username: string): Promise<Starship | null> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error(`Database connection failed for getStarship(${username}):`, error);
      return null;
    }

    return new Promise((resolve, reject) => {
      this.db!.get(
        "SELECT * FROM starships WHERE username = ?",
        [username],
        async (err: Error | null, row: StarshipRow | undefined) => {
          if (err) {
            console.error(`Error fetching starship for ${username}:`, err);
            return resolve(null);
          }
          if (!row) return resolve(null);

          try {
            // >>> Always sync with current player credits
            const player = await this.getPlayer(username);
            
            resolve({
              name: row.name,
              baseSpeed: row.baseSpeed,
              currentSpeed: row.currentSpeed,
              fuel: row.fuel,
              credits: player.credits, // <<< Always use current player credits
              damage: row.damage,
              cargo: JSON.parse(row.cargo),
              location: row.location,
              distance: row.distance,
              lastFlightDate: row.lastFlightDate,
              inFlight: row.inFlight ? JSON.parse(row.inFlight) : undefined,
              canLand: row.canLand !== undefined ? Boolean(row.canLand) : true,
              exploreCount: row.exploreCount || 0,
              hasLanded: row.hasLanded !== undefined ? Boolean(row.hasLanded) : false,
              hasExploredThisLanding: row.hasExploredThisLanding !== undefined ? Boolean(row.hasExploredThisLanding) : false,
              lastItemUpdate: row.lastItemUpdate || 0,
            });
          } catch (e) {
            console.error(`Error parsing starship data for ${username}:`, e);
            resolve(null);
          }
        }
      );
    });
  }

  async saveStarship(username: string, ship: Starship): Promise<void> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error(`Database connection failed for saveStarship(${username}):`, error);
      throw new Error('Database connection failed');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(
        `INSERT OR REPLACE INTO starships (
          username, name, baseSpeed, currentSpeed, fuel, damage, 
          cargo, location, distance, lastFlightDate, inFlight, canLand, 
          exploreCount, hasLanded, hasExploredThisLanding, lastItemUpdate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          username,
          ship.name,
          ship.baseSpeed,
          ship.currentSpeed,
          ship.fuel,
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
          if (err) {
            console.error(`Error saving starship for ${username}:`, err);
            reject(new Error(`Failed to save starship: ${err.message}`));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteStarship(username: string): Promise<void> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error(`Database connection failed for deleteStarship(${username}):`, error);
      throw new Error('Database connection failed');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(
        "DELETE FROM starships WHERE username = ?",
        [username],
        (err: Error | null) => {
          if (err) {
            console.error(`Error deleting starship for ${username}:`, err);
            reject(new Error(`Failed to delete starship: ${err.message}`));
          } else {
            console.log(`🚀 Deleted starship for ${username}`);
            resolve();
          }
        }
      );
    });
  }

  // >>> Credit Management
  async getPlayerCredits(username: string): Promise<number> {
    const player = await this.getPlayer(username);
    return player.credits;
  }

  async spendCredits(username: string, amount: number): Promise<boolean> {
    try {
      const player = await this.getPlayer(username);
      
      if (player.credits < amount) {
        console.log(`❌ ${username} tried to spend ${amount} credits but only has ${player.credits}`);
        return false;
      }
      
      await this.updatePlayerCredits(username, -amount);
      return true;
    } catch (error) {
      console.error(`Error spending credits for ${username}:`, error);
      return false;
    }
  }

  async addCredits(username: string, amount: number): Promise<void> {
    await this.updatePlayerCredits(username, amount);
  }

  async transferCredits(fromUser: string, toUser: string, amount: number): Promise<boolean> {
    try {
      const fromPlayer = await this.getPlayer(fromUser);
      if (fromPlayer.credits < amount) {
        return false;
      }
      
      await this.updatePlayerCredits(fromUser, -amount);
      await this.updatePlayerCredits(toUser, amount);
      
      console.log(`💸 ${fromUser} transferred ${amount} credits to ${toUser}`);
      return true;
    } catch (error) {
      console.error(`Error transferring credits from ${fromUser} to ${toUser}:`, error);
      return false;
    }
  }

  // >>> Flight Management
  async getStarshipsInFlight(): Promise<{ username: string; inFlight: Starship["inFlight"] }[]> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error('Database connection failed for getStarshipsInFlight:', error);
      return [];
    }

    return new Promise((resolve, reject) => {
      this.db!.all(
        "SELECT username, inFlight FROM starships WHERE inFlight IS NOT NULL",
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching ships in flight:', err);
            return resolve([]);
          }

          const results: { username: string; inFlight: Starship["inFlight"] }[] = [];
          for (const row of rows) {
            try {
              if (row.inFlight) {
                results.push({
                  username: row.username,
                  inFlight: JSON.parse(row.inFlight),
                });
              }
            } catch (e) {
              console.error("Error parsing in-flight data for", row.username, ":", e);
            }
          }
          resolve(results);
        }
      );
    });
  }

  async getStarshipLeaderboard(limit: number = 10): Promise<{ username: string; name: string; distance: number; location: string }[]> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error('Database connection failed for getStarshipLeaderboard:', error);
      return [];
    }

    return new Promise((resolve, reject) => {
      this.db!.all(
        "SELECT username, name, distance, location FROM starships ORDER BY distance DESC LIMIT ?",
        [limit],
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching leaderboard:', err);
            return resolve([]);
          }
          
          const results = rows.map(row => ({
            username: row.username,
            name: row.name,
            distance: row.distance,
            location: row.location
          }));
          resolve(results);
        }
      );
    });
  }

  // >>> Connection Management
  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('GlobalDatabase connection closed.');
        }
      });
      this.db = null;
      this.isInitialized = false;
      GlobalDatabase.instance = null;
      GlobalDatabase.isInitializing = false;
    }
  }

  async getDatabaseWithConnection(): Promise<sqlite3.Database> {
    await this.ensureConnection();
    if (!this.db) {
      throw new Error('Failed to establish database connection');
    }
    return this.db;
  }

  getDatabase(): sqlite3.Database | null {
    return this.db;
  }

  // >>> Utility Methods
  async getAllPlayerNames(): Promise<string[]> {
    try {
      await this.ensureConnection();
    } catch (error) {
      console.error('Database connection failed for getAllPlayerNames:', error);
      return [];
    }

    return new Promise((resolve, reject) => {
      this.db!.all(
        "SELECT username FROM players ORDER BY username",
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching player names:', err);
            return resolve([]);
          }
          
          const names = rows.map(row => row.username);
          resolve(names);
        }
      );
    });
  }
}

// ^^^ Database Utilities - Testing and Debugging Tools ^^^

// >>> Utilities for database management, testing, and debugging
// >>> Provides tools to inspect and manage the centralized database

import { GlobalDatabase } from "./GlobalDatabase.js";

export class DatabaseUtils {
  private globalDb: GlobalDatabase;

  constructor() {
    this.globalDb = GlobalDatabase.getInstance();
  }

  // ^^^ Database Inspection Tools ^^^
  
  // >>> List all players
  async listAllPlayers(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM players", (err, rows) => {
        if (err) return reject(err);
        
        console.log("📊 All Players:");
        console.table(rows);
        resolve();
      });
    });
  }

  // >>> List all starships
  async listAllStarships(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    return new Promise((resolve, reject) => {
      db.all("SELECT username, name, location, fuel, damage, distance FROM starships", (err, rows) => {
        if (err) return reject(err);
        
        console.log("🚀 All Starships:");
        console.table(rows);
        resolve();
      });
    });
  }

  // >>> Get database stats
  async getStats(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    const playerCount = await new Promise<number>((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM players", (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const starshipCount = await new Promise<number>((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM starships", (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalCredits = await new Promise<number>((resolve, reject) => {
      db.get("SELECT SUM(credits) as total FROM players", (err, row: any) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    console.log("📈 Database Statistics:");
    console.log(`   👥 Players: ${playerCount}`);
    console.log(`   🚀 Starships: ${starshipCount}`);
    console.log(`   💰 Total Credits: ${totalCredits}`);
  }

  // ^^^ Testing Tools ^^^
  
  // >>> Create test player
  async createTestPlayer(username: string = "testuser"): Promise<void> {
    const player = await this.globalDb.getPlayer(username);
    console.log(`✅ Created test player: ${username}`, player);
  }

  // >>> Create test starship
  async createTestStarship(username: string = "testuser"): Promise<void> {
    const testStarship = {
      name: `${username}'s Test Ship`,
      baseSpeed: 1000,
      currentSpeed: 1000,
      fuel: 100,
      credits: 100,
      damage: 0,
      cargo: [
        { item: "Gewürz", quantity: 2, value: 50 },
        { item: "Tibanna-Gas", quantity: 1, value: 100 }
      ],
      location: "Tatooine",
      distance: 0,
      canLand: true,
      exploreCount: 0,
      hasLanded: false,
      hasExploredThisLanding: false,
      lastItemUpdate: Date.now()
    };

    await this.globalDb.saveStarship(username, testStarship);
    console.log(`✅ Created test starship for: ${username}`);
  }

  // ^^^ Cleanup Tools ^^^
  
  // >>> Clear all data (use with caution!)
  async clearAllData(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM starships", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM players", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("🗑️ All data cleared!");
  }

  // >>> Remove test data
  async clearTestData(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM starships WHERE username LIKE '%test%'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.run("DELETE FROM players WHERE username LIKE '%test%'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("🧹 Test data cleared!");
  }

  // ^^^ Validation Tools ^^^
  
  // >>> Check data integrity
  async validateDataIntegrity(): Promise<void> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    console.log("🔍 Checking data integrity...");

    // >>> Check for players without starships
    const playersWithoutStarships = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT p.username FROM players p 
         LEFT JOIN starships s ON p.username = s.username 
         WHERE s.username IS NULL`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // >>> Check for starships without players (should not happen with FK constraint)
    const starshipsWithoutPlayers = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT s.username FROM starships s 
         LEFT JOIN players p ON s.username = p.username 
         WHERE p.username IS NULL`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`👥 Players without starships: ${playersWithoutStarships.length}`);
    if (playersWithoutStarships.length > 0) {
      console.log("   ", playersWithoutStarships.map(p => p.username));
    }

    console.log(`🚀 Starships without players: ${starshipsWithoutPlayers.length}`);
    if (starshipsWithoutPlayers.length > 0) {
      console.log("   ", starshipsWithoutPlayers.map(s => s.username));
    }

    console.log("✅ Data integrity check complete!");
  }

  // ^^^ Export/Import Tools ^^^
  
  // >>> Export all data to JSON (for backup)
  async exportToJSON(): Promise<any> {
    const db = await this.globalDb.getDatabaseWithConnection();
    
    const players = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM players", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const starships = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM starships", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      players,
      starships
    };

    console.log(`📦 Exported data: ${players.length} players, ${starships.length} starships`);
    return exportData;
  }
}

// >>> CLI Commands for database management
export async function runDatabaseCommand(command: string, ...args: string[]) {
  const utils = new DatabaseUtils();
  
  switch (command) {
    case 'stats':
      await utils.getStats();
      break;
    case 'list-players':
      await utils.listAllPlayers();
      break;
    case 'list-starships':
      await utils.listAllStarships();
      break;
    case 'create-test':
      await utils.createTestPlayer(args[0] || 'testuser');
      await utils.createTestStarship(args[0] || 'testuser');
      break;
    case 'clear-test':
      await utils.clearTestData();
      break;
    case 'validate':
      await utils.validateDataIntegrity();
      break;
    case 'export':
      const data = await utils.exportToJSON();
      console.log(JSON.stringify(data, null, 2));
      break;
    default:
      console.log("Available commands:");
      console.log("  stats - Show database statistics");
      console.log("  list-players - List all players");
      console.log("  list-starships - List all starships");
      console.log("  create-test [username] - Create test data");
      console.log("  clear-test - Clear test data");
      console.log("  validate - Check data integrity");
      console.log("  export - Export all data to JSON");
  }
  
  process.exit(0);
}

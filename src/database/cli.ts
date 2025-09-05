// ^^^ Database CLI - Command Line Interface for Database Management ^^^

// >>> Run this file directly to manage the database from command line
// >>> Usage: node dist/database/cli.js [command] [args...]

import { runDatabaseCommand } from "./DatabaseUtils.js";

const args = process.argv.slice(2);
const command = args[0];
const params = args.slice(1);

if (!command) {
  console.log("🗄️  StarWarsly Database CLI");
  console.log("Usage: node dist/database/cli.js [command] [args...]");
  console.log("");
  runDatabaseCommand('help');
} else {
  runDatabaseCommand(command, ...params);
}

// ^^^ StarWarsly Command - Starship Adventure System ^^^

// >>> Main starship command that handles all space exploration functionality.
// >>> Provides an immersive Star Wars experience with ship management, exploration,
// >>> trading, combat, and interactive events across the galaxy.

import type { BotCommandContext } from "../../types/index.js";
import type { Starship } from "./types.js";
import { BASE_SPEED } from "./constants.js";
import { StarshipDatabase } from "./StarshipDatabase.js";
import { ShipUtils } from "./utils.js";
import { FlightCommands } from "./flightCommands.js";
import { PlanetCommands } from "./planetCommands.js";
import { CargoCommands } from "./cargoCommands.js";
import { MaintenanceCommands } from "./maintenanceCommands.js";
import { StatusCommands } from "./statusCommands.js";
import { TransferCommands } from "./transferCommands.js";
import { LeaderboardCommands } from "./leaderboardCommands.js";
import { initializeBackgroundChecker } from "./backgroundChecker.js";
import { InteractiveEventManager } from "./interactiveEvents.js";

// vvv Database Initialization vvv
// >>> Create database instance for persistent ship storage
const starshipDB = new StarshipDatabase();

export default {
  name: "starship",
  description: "Intergalactic starship adventure system",
  defaultModOnly: false,
  globalCooldown: 5,
  execute: async (params: string[], context: BotCommandContext) => {
    const { channel, msg, say, bot } = context;
    const userName = msg.userInfo.userName.toLowerCase();
    const displayName = msg.userInfo.displayName;

    // >>> Initialize background checker
    initializeBackgroundChecker(bot);

    // >>> Helper function to reply to user
    const reply = (message: string) => {
      bot.say(channel, `${message}`, { replyTo: msg.id });
    };

    // >>> Get ship from database
    let ship: Starship | null = await starshipDB.get(userName);

    if (!ship) {
      console.log(`Creating new starship for ${userName}`);
      // >>> Get random starting planet
      const planetNames = ShipUtils.getPlanetNames();
      const startPlanet =
        planetNames[Math.floor(Math.random() * planetNames.length)];
      ship = {
        name: `${displayName}'s Starship`,
        baseSpeed: BASE_SPEED,
        currentSpeed: BASE_SPEED,
        fuel: 100,
        credits: 100,
        damage: 0,
        cargo: [],
        location: startPlanet,
        distance: 0,
        canLand: true,
        exploreCount: 0,
        hasLanded: false,
        hasExploredThisLanding: false,
      };
      await starshipDB.save(userName, ship);
    }

    // >>> Helper function to save ship state
    const saveShip = async () => {
      ShipUtils.updateShipSpeed(ship!);
      // >>> Ensure credits are always rounded before saving
      ship!.credits = Math.round(ship!.credits);
      await starshipDB.save(userName, ship!);
    };

    // >>> First, check for any completed flights
    await FlightCommands.checkFlightCompletion(ship, bot, displayName);
    
    // >>> Update functional items effects
    const functionalUpdates = ShipUtils.updateFunctionalItems(ship);
    functionalUpdates.messages.forEach(message => reply(message));

    // vvv Subcommand handling vvv
    // >>> Subcommand router
    const validParams = params.filter((p) => p.trim() !== "");
    const subcommand = validParams[0]?.toLowerCase();
    const args = validParams.slice(1);

    // >>> Execute subcommands
    try {
      switch (subcommand) {
        case undefined:
        case "status":
          await StatusCommands.showStatus(ship, reply);
          break;
        case "name":
          await MaintenanceCommands.renameShip(ship, args, reply);
          await saveShip();
          break;
        case "fly":
          await FlightCommands.flyToLocation(ship, args, reply, channel, displayName);
          await saveShip();
          break;
        case "land":
          await PlanetCommands.landOnPlanet(ship, reply);
          if (ship.damage >= 100) {
            await starshipDB.delete(userName);
            return;
          }
          await saveShip();
          break;
        case "repair":
          await MaintenanceCommands.repairShip(ship, args, reply);
          await saveShip();
          break;
        case "refuel":
          await MaintenanceCommands.refuelShip(ship, args, reply);
          await saveShip();
          break;
        case "explore":
          if (args.length > 0 && args[0].toLowerCase() === "help") {
            await PlanetCommands.showExplorationHelp(reply);
          } else {
            await PlanetCommands.explore(ship, args, reply, userName, channel);
            if (ship.damage >= 100) {
              await starshipDB.delete(userName);
              return;
            }
            await saveShip();
          }
          break;
        case "cargo":
          await CargoCommands.showCargo(ship, reply);
          break;
        case "sell":
          await CargoCommands.sellCargo(ship, args, reply);
          await saveShip();
          break;
        case "jettison":
        case "drop":
          await CargoCommands.jettisonCargo(ship, args, reply);
          await saveShip();
          break;
        case "hyperspace":
          await FlightCommands.hyperspaceBoost(ship, reply);
          await saveShip();
          break;
        case "transfer":
        case "give":
          if (args.length < 2) {
            reply("Usage: #starship transfer <player> <amount>");
          } else {
            const targetPlayer = args[0];
            const amount = parseInt(args[1]);
            if (isNaN(amount)) {
              reply("Invalid amount! Use numbers only.");
            } else {
              await TransferCommands.transferCredits(ship, targetPlayer, amount, starshipDB, reply);
              await saveShip();
            }
          }
          break;
        case "help":
          await StatusCommands.showHelp(reply);
          break;
        
        case "leaderboard":
        case "lb":
        case "ranking":
          await LeaderboardCommands.showLeaderboard(starshipDB, reply);
          break;
        
        // >>> Interactive event commands
        case "shelter":
        case "run":
        case "hide":
        case "bribe":
        case "fight":
        case "peace":
        case "buy":
        case "inspect":
        case "sneak":
        case "retreat":
        case "shields":
        case "weapons":
        case "mask":
        case "accept":
        case "decline":
        case "climb":
          // >>> Handle interactive event commands
          const interactiveResult = InteractiveEventManager.handleCommand(subcommand, userName, channel);
          if (interactiveResult) {
            // >>> Apply the result to the ship
            if (interactiveResult.damage) ship.damage = Math.min(100, Math.max(0, ship.damage + interactiveResult.damage));
            if (interactiveResult.credits) ship.credits = Math.round(ship.credits + interactiveResult.credits);
            if (interactiveResult.addCargo) {
              ShipUtils.addCargo(ship, interactiveResult.addCargo.item, interactiveResult.addCargo.quantity);
            }
            if (interactiveResult.removeCargo && ship.cargo.length > 0) {
              const randomIndex = Math.floor(Math.random() * ship.cargo.length);
              const randomItem = ship.cargo[randomIndex].item;
              const removed = ShipUtils.removeCargo(ship, randomItem, 1);
              if (removed) reply(`❗ 1x ${randomItem} verloren!`);
            }
            
            // >>> Check for ship destruction
            if (ship.damage >= 100) {
              await starshipDB.delete(userName);
              reply(`💥 Dein Schiff wurde zerstört! Game over. Ein neues Schiff wird beim nächsten Mal erstellt.`);
              return;
            }
            
            await saveShip();
            reply(`${interactiveResult.emoji} ${interactiveResult.text}`);
          } else {
            reply(`Unknown subcommand! Use #starship help for commands`);
          }
          break;
          
        default:
          reply(`Unknown subcommand! Use #starship help for commands`);
          break;
      }
    } catch (error: any) {
      reply(`🛑 ${error.message}`);
    }
  },
};

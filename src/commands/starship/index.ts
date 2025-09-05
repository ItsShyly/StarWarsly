// ^^^ StarWarsly Command  ^^^

// >>> Main starship command that handles all space exploration functionality.
// >>> Now integrated with the centralized GlobalDatabase system.
// >>> Provides an immersive Star Wars experience with ship management, exploration,
// >>> trading, combat, and interactive events across the galaxy.

import type { BotCommandContext } from "../../types/index.js";
import type { Starship } from "./types.js";
import { BASE_SPEED } from "./constants.js";
import { GlobalDatabase } from "../../database/GlobalDatabase.js";
import { ShipUtils } from "./utils.js";
import { FlightCommands } from "./flightCommands.js";
import { PlanetCommands } from "./planetCommands.js";
import { CargoCommands } from "./cargoCommands.js";
import { MaintenanceCommands } from "./maintenanceCommands.js";
import { StatusCommands } from "./statusCommands.js";
import { TransferCommands } from "./transferCommands.js";
import { LeaderboardCommands } from "./leaderboardCommands.js";
import { initializeBackgroundChecker } from "./backgroundChecker.js";
import { InteractiveEventManager } from "../../utils/interactiveEvents.js";

// vvv Centralized Database Access vvv
// >>> Use the singleton GlobalDatabase instance
const globalDB = GlobalDatabase.getInstance();

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

    // >>> Get ship from centralized database
    let ship: Starship | null = await globalDB.getStarship(userName);

    if (!ship) {
      console.log(`Creating new starship for ${userName}`);
      // >>> Get random starting planet
      const planetNames = ShipUtils.getPlanetNames();
      const startPlanet =
        planetNames[Math.floor(Math.random() * planetNames.length)];

      // >>> Create ship with synchronized credits from global player data
      const player = await globalDB.getPlayer(userName);
      ship = {
        name: `${displayName}'s Starship`,
        baseSpeed: BASE_SPEED,
        currentSpeed: BASE_SPEED,
        fuel: 100,
        credits: player.credits, // <<< Sync with global credits
        damage: 0,
        cargo: [],
        location: startPlanet,
        distance: 0,
        canLand: true,
        exploreCount: 0,
        hasLanded: false,
        hasExploredThisLanding: false,
      };
      await globalDB.saveStarship(userName, ship);
    } else {
      // >>> Sync ship credits with global player credits
      const player = await globalDB.getPlayer(userName);
      if (ship.credits !== player.credits) {
        ship.credits = player.credits;
        await globalDB.saveStarship(userName, ship);
      }
    }

    // >>> Helper function to save ship state
    const saveShip = async () => {
      ShipUtils.updateShipSpeed(ship!);
      // >>> Ensure credits are always rounded before saving
      ship!.credits = Math.round(ship!.credits);

      // >>> Sync credits with global player data
      const player = await globalDB.getPlayer(userName);
      if (player.credits !== ship!.credits) {
        await globalDB.updatePlayerCredits(
          userName,
          ship!.credits - player.credits
        );
      }

      await globalDB.saveStarship(userName, ship!);
    };

    // >>> First, check for any completed flights
    await FlightCommands.checkFlightCompletion(ship, bot, displayName);

    // >>> Update functional items effects
    const functionalUpdates = ShipUtils.updateFunctionalItems(ship);
    functionalUpdates.messages.forEach((message) => reply(message));

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
          await FlightCommands.flyToLocation(
            ship,
            args,
            reply,
            channel,
            displayName
          );
          await saveShip();
          break;
        case "land":
          await PlanetCommands.landOnPlanet(ship, reply);
          if (ship.damage >= 100) {
            await globalDB.deleteStarship(userName);
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
            await PlanetCommands.explore(
              ship,
              args,
              reply,
              userName,
              channel,
              bot
            );
            if (ship.damage >= 100) {
              await globalDB.deleteStarship(userName);
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
              // >>> Transfer credits between players
              const success = await globalDB.transferCredits(
                userName,
                targetPlayer.toLowerCase(),
                amount
              );
              if (success) {
                // >>> Update ship credits to reflect transfer
                ship.credits = await globalDB.getPlayerCredits(userName);
                await saveShip();
                reply(
                  `💸 ${amount} Credits erfolgreich an ${targetPlayer} transferiert!`
                );
              } else {
                reply(
                  `❌ Transfer fehlgeschlagen! Nicht genügend Credits oder Spieler nicht gefunden.`
                );
              }
            }
          }
          break;
        case "help":
          await StatusCommands.showHelp(bot, channel, reply);
          break;

        case "leaderboard":
        case "lb":
        case "ranking":
          // >>> Show top players by distance
          const leaderboard = await globalDB.getStarshipLeaderboard(10);
          const leaderboardText = leaderboard
            .map(
              (entry, index) =>
                `${index + 1}. ${entry.name} (${
                  entry.username
                }) - ${entry.distance.toFixed(2)} ly`
            )
            .join(" | ");
          reply(`🏆 Starship Leaderboard: ${leaderboardText}`);
          break;

        // >>> Interactive event commands - Commands/interactives/*
        case "shelter":
        case "run":
        case "hide":
        case "pay":
        case "fight":
        case "peace":
        case "buy":
        case "inspect":
        case "sneak":
        case "retreat":
        case "defend":
        case "strike":
        case "mask":
        case "accept":
        case "decline":
        case "fly":
          // >>> Handle interactive event commands
          const interactiveOutcome = InteractiveEventManager.handleCommand(
            subcommand,
            userName,
            channel
          );

          if (interactiveOutcome) {
            const { result, investmentAmount, eventType } = interactiveOutcome;

            // >>> Apply the result to the ship and global player data
            if (result.damage) {
              ship.damage = Math.min(
                100,
                Math.max(0, ship.damage + result.damage)
              );
            }
            if (result.fuel) {
              ship.fuel = Math.min(100, Math.max(0, ship.fuel + result.fuel));
            }
            if (result.credits) {
              await globalDB.addCredits(userName, result.credits);
              ship.credits = await globalDB.getPlayerCredits(userName);
            }
            if (result.addCargo) {
              ShipUtils.addCargo(
                ship,
                result.addCargo.item,
                result.addCargo.quantity
              );
            }
            if (result.removeCargo && ship.cargo.length > 0) {
              const randomIndex = Math.floor(Math.random() * ship.cargo.length);
              const randomItem = ship.cargo[randomIndex].item;
              const removed = ShipUtils.removeCargo(ship, randomItem, 1);
              if (removed) reply(`❗ 1x ${randomItem} verloren!`);
            }

            // >>> Check for ship destruction
            if (ship.damage >= 100) {
              await globalDB.deleteStarship(userName);
              reply(
                `💥 Dein Schiff wurde zerstört! Game over. Ein neues Schiff wird beim nächsten Mal erstellt.`
              );
              return;
            }

            await saveShip();

            // >>> Provide feedback including investment info if relevant
            let feedback = `${result.emoji} ${result.text}`;
            if (investmentAmount && investmentAmount > 0) {
              feedback += ` (Einsatz: ${investmentAmount} Credits, Ergebnis: ${eventType})`;
            }

            reply(feedback);
          } else {
            reply(
              `❗ Keine zeitkritischen Events aktiv. Diese Kommandos funktionieren nur während Erkundungs-Events!`
            );
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

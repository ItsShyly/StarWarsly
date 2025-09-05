// ^^^ Debug Command - Test Interactive System ^^^

import type { BotCommandContext } from "../types/index.js";
import { GlobalDatabase } from "../database/GlobalDatabase.js";
import { InteractiveEventManager } from "../utils/interactiveEvents.js";
import { INTERACTIVE_EVENTS } from "../commands/starship/constants.js";

const globalDB = GlobalDatabase.getInstance();

export default {
  name: "debug",
  description: "Debug command for testing systems",
  defaultModOnly: true, // <<< Only for mods/broadcaster
  globalCooldown: 2,
  execute: async (params: string[], context: BotCommandContext) => {
    const { channel, msg, bot } = context;
    const userName = msg.userInfo.userName.toLowerCase();

    const reply = (message: string) => {
      bot.say(channel, `${message}`, { replyTo: msg.id });
    };

    const subcommand = params[0]?.toLowerCase();

    try {
      switch (subcommand) {
        case "db":
          // >>> Test database connection
          const player = await globalDB.getPlayer(userName);
          reply(`🗄️ DB Test: ${userName} has ${player.credits} credits`);
          break;

        case "starship":
          // >>> Test starship retrieval
          const starship = await globalDB.getStarship(userName);
          if (starship) {
            reply(
              `🚀 Starship: ${starship.name} at ${starship.location} (${starship.credits} credits)`
            );
          } else {
            reply(`❌ No starship found for ${userName}`);
          }
          break;

        case "interactive":
          // >>> Check if interactive event is running, else start one
          const hasEvent = InteractiveEventManager.hasPendingEvent(
            userName,
            channel
          );
          if (hasEvent) {
            const timeRemaining = InteractiveEventManager.getTimeRemaining(
              userName,
              channel
            );
            reply(`🎮 Running interactive event for ${userName} (${Math.ceil(timeRemaining)}s remaining)`);
          } else {
            // >>> Import the GlobalInteractiveHandler for timeout notifications
            const { GlobalInteractiveHandler } = await import("../utils/globalInteractiveHandler.js");
            
            // Get a random interactive event or use a specific one if provided
            let eventIndex = 0;
            if (params[1] && !isNaN(parseInt(params[1]))) {
              eventIndex = parseInt(params[1]) % INTERACTIVE_EVENTS.length;
            } else {
              eventIndex = Math.floor(Math.random() * INTERACTIVE_EVENTS.length);
            }
            
            const testEvent = INTERACTIVE_EVENTS[eventIndex];
            const investmentAmount = params[2] ? parseInt(params[2]) : 0;
            
            GlobalInteractiveHandler.createInteractiveEvent(
              testEvent,
              userName,
              channel,
              bot,
              investmentAmount
            );
            
            // Show available commands
            let commands = "";
            if (typeof testEvent.successCommand === "string") {
              commands = `#${testEvent.successCommand}`;
            } else {
              commands = testEvent.successCommand.map(cmd => `#${cmd}`).join(", ");
            }
            
            reply(
              `🎯 Interactive event started: ${testEvent.emoji} ${testEvent.text} ` +
              `(Investment: ${investmentAmount} credits, Commands: ${commands})`
            );
          }
          break;

        case "credits":
          // >>> Test credit operations
          if (params[1] && !isNaN(parseInt(params[1]))) {
            const amount = parseInt(params[1]);
            await globalDB.addCredits(userName, amount);
            reply(`💰 Added ${amount} credits to ${userName}`);
          } else {
            reply(`Usage: #debug credits <amount>`);
          }
          break;

        case "info":
          // >>> System info
          try {
            const player = await globalDB.getPlayer(userName);
            const starship = await globalDB.getStarship(userName);
            const hasEvents = InteractiveEventManager.hasPendingEvent(
              userName,
              channel
            );
            const eventCount = InteractiveEventManager.getPendingCount();

            reply(
              `📊 System Info for ${userName}: Credits: ${
                player.credits
              }, Starship: ${
                starship ? starship.name : "None"
              }, Active Events: ${hasEvents}, Global Events: ${eventCount}`
            );
          } catch (error: any) {
            reply(`❌ Info error: ${error.message}`);
          }
          break;
          
        case "clear-events":
          // >>> Clear all interactive events
          InteractiveEventManager.clearAll();
          reply(`🗑️ Cleared all interactive events`);
          break;

        default:
          reply(
            `🔧 Debug options: db, starship, interactive [id] [investment], interactive-list, interactive-test [investment], credits <amount>, info, clear-events`
          );
      }
    } catch (error: any) {
      reply(`❌ Debug error: ${error.message}`);
      console.error("Debug command error:", error);
    }
  },
};
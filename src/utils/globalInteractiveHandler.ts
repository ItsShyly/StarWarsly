// ^^^ Global Interactive Command Handler ^^^

import type { BotCommandContext } from '../types/index.js';
import { GlobalDatabase } from '../database/GlobalDatabase.js';
import { InteractiveEventManager } from '../utils/interactiveEvents.js';
import type { InteractiveEventResult, InteractiveEvent } from '../commands/starship/types.js';
import { 
  scaleInteractiveEventResult, 
  getInvestmentTier, 
  shouldTriggerRareEvent,
  getCommandType,
  getSuccessRate 
} from '../commands/starship/constants.js';
const globalDB = GlobalDatabase.getInstance();

export class GlobalInteractiveHandler {
  // vvv Create Interactive Event with Timeout Notification vvv
  // >>> Creates an interactive event with automatic timeout handling
  static createInteractiveEvent(
    event: InteractiveEvent,
    userId: string,
    channelId: string,
    bot: any,
    investmentAmount: number = 0
  ): void {
    const timeoutCallback = () => {
      // >>> Handle timeout - apply timeout result if available, otherwise failure result
      let resultToApply = event.timeoutResult || event.failureResult;
      const reply = (message: string) => {
        bot.say(channelId, message);
      };

      // >>> Scale the result if investment amount is provided
      if (investmentAmount && investmentAmount > 0) {
        const tier = getInvestmentTier(investmentAmount);
        const isRareEvent = shouldTriggerRareEvent("FAILURE"); // Timeout is treated like failure for rare event chances
        resultToApply = scaleInteractiveEventResult(
          resultToApply,
          investmentAmount,
          tier,
          event.timeoutResult ? "TIMEOUT" : "FAILURE",
          isRareEvent
        );
      }

      // >>> Notify user about timeout
      let message = `⏰ Nicht rechtzeitig geschafft.. ${resultToApply.emoji} ${resultToApply.text}`;
      const effects: string[] = [];

      if (resultToApply.credits) {
        effects.push(
          `${resultToApply.credits > 0 ? "+" : ""}${
            resultToApply.credits
          } credits`
        );
      }
      if (resultToApply.damage) {
        effects.push(
          `${resultToApply.damage > 0 ? "+" : ""}${
            resultToApply.damage
          }% Schaden`
        );
      }
      if (resultToApply.fuel) {
        effects.push(
          `${resultToApply.fuel > 0 ? "+" : ""}${
            resultToApply.fuel
          }% Treibstoff`
        );
      }

      if (effects.length > 0) {
        message += ` (${effects.join(", ")})`;
      }

      reply(message);

      // >>> Apply timeout effects
      this.applyEventResult(userId, resultToApply, reply).catch((error) => {
        console.error(`❌ Error applying timeout result for ${userId}:`, error);
      });
    };

    InteractiveEventManager.startEvent(
      event,
      userId,
      channelId,
      timeoutCallback,
      investmentAmount
    );
  }

  static async handleInteractiveCommand(
    commandName: string,
    context: BotCommandContext
  ): Promise<void> {
    const { channel, msg, bot } = context;
    const userName = msg.userInfo.userName.toLowerCase();
    const displayName = msg.userInfo.displayName;

    console.log(
      `🎮 Interactive command: ${commandName} from ${userName} in ${channel}`
    );

    const reply = (message: string) => {
      bot.say(channel, `${message}`, { replyTo: msg.id });
    };

    try {
      // >>> Check for pending interactive events first
      console.log(`🔍 Checking for interactive events for ${userName}...`);
      const eventData = InteractiveEventManager.handleCommand(
        commandName,
        userName,
        channel
      );

      if (eventData) {
        console.log(`✅ Interactive event handled:`, eventData);
        await this.applyEventResult(userName, eventData.result, reply);

        // >>> Display result with credit/damage info if applicable
        let message = `${eventData.result.emoji} ${eventData.result.text}`;
        const effects: string[] = [];

        if (eventData.result.credits) {
          effects.push(
            `${eventData.result.credits > 0 ? "+" : ""}${
              eventData.result.credits
            } credits`
          );
        }
        if (eventData.result.damage) {
          effects.push(
            `${eventData.result.damage > 0 ? "+" : ""}${
              eventData.result.damage
            }% Schaden`
          );
        }
        if (eventData.result.fuel) {
          effects.push(
            `${eventData.result.fuel > 0 ? "+" : ""}${
              eventData.result.fuel
            }% Treibstoff`
          );
        }

        if (effects.length > 0) {
          message += ` (${effects.join(", ")})`;
        }

        reply(message);
        return;
      }

      // >>> No pending event, check if player has a starship
      console.log(`🚀 Checking starship for ${userName}...`);
      const starship = await globalDB.getStarship(userName);

      if (!starship) {
        console.log(`❌ No starship found for ${userName}`);
        reply(
          `🚀 Du hast noch kein Raumschiff! Benutze #starship um eines zu erstellen.`
        );
        return;
      }

      console.log(`✅ Starship found for ${userName}: ${starship.name}`);
      await this.handleStarshipContext(commandName, userName, reply);
    } catch (error: any) {
      console.error(
        `❌ Error in interactive command ${commandName} for ${userName}:`,
        error
      );
      reply(`🛑 Fehler: ${error.message || "Unbekannter Fehler"}`);
    }
  }

  static async applyEventResult(
    userName: string,
    result: InteractiveEventResult,
    reply: (message: string) => void,
    investmentAmount?: number,
    eventType?: "SUCCESS" | "FAILURE" | "TIMEOUT"
  ): Promise<void> {
    console.log(`💫 Applying event result for ${userName}:`, result);

    try {
      // >>> Apply credit changes
      if (result.credits) {
        await globalDB.addCredits(userName, result.credits);
        console.log(
          `💰 ${userName}: Credits ${result.credits > 0 ? "+" : ""}${
            result.credits
          }`
        );
      }

      // >>> Apply damage to starship if exists
      if (result.damage) {
        const starship = await globalDB.getStarship(userName);
        if (starship) {
          starship.damage = Math.min(
            100,
            Math.max(0, starship.damage + result.damage)
          );

          if (starship.damage >= 100) {
            await globalDB.deleteStarship(userName);
            reply(
              `💥 Dein Schiff wurde zerstört! Ein neues Schiff wird beim nächsten #starship Kommando erstellt.`
            );
          } else {
            await globalDB.saveStarship(userName, starship);
          }
        }
      }

      // >>> Apply fuel changes
      if (result.fuel) {
        const starship = await globalDB.getStarship(userName);
        if (starship) {
          starship.fuel = Math.min(
            100,
            Math.max(0, starship.fuel + result.fuel)
          );
          await globalDB.saveStarship(userName, starship);
        }
      }

      // >>> Handle cargo additions
      if (result.addCargo) {
        const starship = await globalDB.getStarship(userName);
        if (starship) {
          const existingCargo = starship.cargo.find(
            (c) => c.item === result.addCargo!.item
          );
          if (existingCargo) {
            existingCargo.quantity += result.addCargo!.quantity;
          } else {
            starship.cargo.push({
              item: result.addCargo!.item,
              quantity: result.addCargo!.quantity,
            });
          }
          await globalDB.saveStarship(userName, starship);
        }
      }

      // >>> Handle cargo removal
      if (result.removeCargo) {
        const starship = await globalDB.getStarship(userName);
        if (starship && starship.cargo.length > 0) {
          const randomIndex = Math.floor(Math.random() * starship.cargo.length);
          const removed = starship.cargo[randomIndex];
          starship.cargo.splice(randomIndex, 1);
          await globalDB.saveStarship(userName, starship);
          reply(`❗ ${removed.quantity}x ${removed.item} verloren!`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error applying event result for ${userName}:`, error);
      reply(`🛑 Fehler beim Anwenden der Ereigniseffekte: ${error.message}`);
    }
  }

  private static async handleStarshipContext(
    commandName: string,
    userName: string,
    reply: (message: string) => void
  ): Promise<void> {
    console.log(
      `🎯 Handling starship context command: ${commandName} for ${userName}`
    );

    switch (commandName) {
      case "buy":
        reply(
          `🛒 Gerade gibt es nichts zu kaufen. Erkunde Planeten für Handelsmöglichkeiten!`
        );
        break;

      case "inspect":
        reply(
          `🔍 Nichts Interessantes zu inspizieren. Versuche es während einer Erkundung!`
        );
        break;

      case "run":
      case "hide":
      case "fight":
      case "retreat":
      case "shelter":
        reply(
          `⚠️ Keine Gefahr in Sicht. Diese Kommandos funktionieren nur während Events!`
        );
        break;

      case "defend":
      case "strike":
        reply(
          `🚫 Keine feindlichen Schiffe in Reichweite. Warte auf ein Kampf-Event!`
        );
        break;

      case "mask":
        reply(`😷 Keine giftigen Gase detektiert. Deine Atemluft ist sauber!`);
        break;

      case "pay":
        reply(`💰 Niemand hier, den du bestechen könntest!`);
        break;

      case "peace":
      case "accept":
      case "decline":
        reply(`🤝 Keine Verhandlungen oder Angebote ausstehend.`);
        break;

      case "sneak":
      case "fly":
        reply(
          `🕴️ Keine Hindernisse zu überwinden. Erkunde einen Planeten für Abenteuer!`
        );
        break;

      case "strike":
        reply(
          `⚔️ Keine feindlichen Ziele in Reichweite. Diese Kommandos funktionieren nur während Events!`
        );
        break;

      default:
        reply(
          `❓ Unbekanntes Kommando: ${commandName}. Diese Kommandos funktionieren nur während zeitkritischen Events!`
        );
        break;
    }
  }

  static isInteractiveCommand(commandName: string): boolean {
    const interactiveCommands = [
      "buy",
      "inspect",
      "run",
      "hide",
      "fight",
      "pay",
      "peace",
      "sneak",
      "retreat",
      "shelter",
      "defend",
      "strike",
      "mask",
      "accept",
      "decline",
      "fly",
    ];
    return interactiveCommands.includes(commandName.toLowerCase());
  }

static getInteractiveCommandHelp(): string {
  return `🎮 Interaktive Kommandos: | 
#run - Fliehe vor Gefahr | 
#fight - Kämpfe gegen Feinde | 
#hide - Verstecke dich | 
#pay - Besteche deinen Weg frei | 
#buy - Kaufe Gegenstände | 
#inspect - Untersuche etwas genauer | 
#sneak - Schleiche vorbei | 
#shelter - Suche Schutz | 
#peace - Verhandle friedlich | 
⏱️ Du hast nur begrenzt Zeit zu reagieren!`;
}

}

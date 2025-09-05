// ^^^ Starship Planet Commands - Surface Operations ^^^

// >>> Handles all planet surface interactions including landing, exploration,
// >>> resource discovery, and event encounters. Manages exploration investments
// >>> and interactive event triggers for immersive planetary experiences.

import type { Starship, InteractiveEventResult } from "./types.js";
import { LANDING_EVENTS } from "./constants.js";
import { ShipUtils } from "./utils.js";
import { ExplorationUtils } from "./explorationUtils.js";
import { InteractiveEventManager } from "../../utils/interactiveEvents.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

// vvv Planet Interaction Commands vvv
export class PlanetCommands {
  // ^^^ Landing Sequence Handler ^^^
  static async landOnPlanet(ship: Starship, reply: (msg: string) => void): Promise<void> {
    // vvv Pre-Landing Validation vvv
    // >>> Ensure ship is ready to land
    if (ship.inFlight)
      throw new Error("Noch am Fliegen! Warte auf Ankunft...");
    if (!ship.canLand)
      throw new Error(
        "Du bist bereits auf diesem Planeten gelandet. Fliege zu einem anderen Planeten, um erneut zu landen."
      );

    // vvv Landing Event Processing vvv
    // >>> Generate random landing outcome
    const event = LANDING_EVENTS[Math.floor(Math.random() * LANDING_EVENTS.length)];
    ShipUtils.applyEvent(ship, event, reply);
    
    // >>> Update landing status flags
    ship.canLand = false;
    ship.hasLanded = true;
    // >>> Reset exploration status for new landing
    ship.hasExploredThisLanding = false;

    if (ship.damage >= 100) {
      throw new Error("💥 Dein Schiff wurde zerstört! Game over. Ein neues Schiff wird beim nächsten Mal erstellt.");
    }

    reply(`${event.emoji} ${event.text}`);
  }

  // ^^^ Planetary Exploration System ^^^
  static async explore(ship: Starship, args: string[], reply: (msg: string) => void, userId?: string, channelId?: string, bot?: any): Promise<void> {
    // vvv Exploration Prerequisites vvv
    // >>> Validate exploration conditions
    if (ship.inFlight)
      throw new Error("Erkunden während des Flugs nicht möglich!");
    if (!ship.hasLanded)
      throw new Error(
        "Du musst zuerst auf dem Planeten landen, bevor du erkunden kannst!"
      );
    if (ship.hasExploredThisLanding)
      throw new Error(
        "Du hast diesen Planeten bereits erkundet. Fliege zu einem neuen Planeten, um mehr zu erkunden."
      );

    // vvv Investment Parsing vvv
    // >>> Parse investment amount
    if (args.length === 0) {
      throw new Error(
        "Du musst einen Investitionsbetrag angeben! Beispiel: `#starship explore 150`\n" +
        "**Investitionsebenen:**\n" +
        `• ${ExplorationUtils.getTierDescription(1)}\n` +
        `• ${ExplorationUtils.getTierDescription(2)}\n` +
        `• ${ExplorationUtils.getTierDescription(3)}\n` +
        `• ${ExplorationUtils.getTierDescription(4)}`
      );
    }

    const investmentAmount = parseInt(args[0]);
    if (isNaN(investmentAmount)) {
      throw new Error("Investitionsbetrag muss eine Zahl sein!");
    }

    // vvv Investment Validation vvv
    // >>> Validate investment against player resources
    const validationError = ExplorationUtils.validateInvestment(investmentAmount, ship.credits);
    if (validationError) {
      throw new Error(validationError);
    }

    // vvv Resource Deduction vvv
    // >>> Deduct investment from credits
    ship.credits = Math.round(ship.credits - investmentAmount);

    // vvv Event Generation vvv
    // >>> Generate exploration result (potentially with interactive event + multiple events)
    const results = ExplorationUtils.generateExplorationResultWithInteractive(investmentAmount);
    
    // vvv Effect Application vvv
    // >>> Apply all the scaled event effects
    results.forEach(result => {
      ShipUtils.applyEvent(ship, result.scaledEvent, reply);
    });
    
    // >>> Mark as explored for this landing
    ship.hasExploredThisLanding = true;
    ship.exploreCount++; // <<< Track total explorations

    if (ship.damage >= 100) {
      throw new Error("💥 Dein Raumschiff wurde zerstört! Game over. Ein neues Schiff wird beim nächsten Mal erstellt.");
    }

    // vvv Result Messaging vvv
    // >>> Send formatted result message for all events
    const resultMessage = ExplorationUtils.formatMultipleExplorationResults(results);
    reply(resultMessage);
    
    // vvv Interactive Event Handling vvv
    // >>> Check for interactive event (only on first result)
    const firstResult = results[0];
    if ((firstResult as any).interactiveEvent && userId && channelId && bot) {
      // >>> Use timeout notification system with investment amount for scaling
      GlobalInteractiveHandler.createInteractiveEvent(
        (firstResult as any).interactiveEvent, 
        userId, 
        channelId,
        bot,
        investmentAmount
      );
      
      // >>> Send interactive event message with timer
      const event = (firstResult as any).interactiveEvent;
      reply(`\n${event.emoji} ${event.text}`);
    }
  }
  // ^^^ Exploration Help Display ^^^
  // >>> Show exploration help and tier information
  static async showExplorationHelp(reply: (msg: string) => void): Promise<void> {
    const helpMessage = `
🚀 Starship Erkundungssystem - #starship explore <betrag> | 
${ExplorationUtils.getTierDescription(1)} = ${ExplorationUtils.getTierName(1)} | 
${ExplorationUtils.getTierDescription(2)} = ${ExplorationUtils.getTierName(2)} | 
${ExplorationUtils.getTierDescription(3)} = ${ExplorationUtils.getTierName(3)} | 
${ExplorationUtils.getTierDescription(4)} = ${ExplorationUtils.getTierName(4)} | 
🔍 Höhere Investitionen = bessere Chancen für seltene Events | Mehrere Events sind SEHR selten (max 2 Events) | Wertvolle Fracht = keine Extra-Credits!`;
    reply(helpMessage.trim());
  }
}
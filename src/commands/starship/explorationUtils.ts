import type { TieredExplorationEvent, ExplorationResult, GameEvent } from "./types.js";
import { TIERED_EXPLORATION_EVENTS, INVESTMENT_TIERS, INTERACTIVE_EVENTS } from "./constants.js";
import type { InteractiveEvent } from "./types.js";

export class ExplorationUtils {
// >>> Determine investment tier based on amount invested
  static getInvestmentTier(amount: number): number {
    if (amount >= INVESTMENT_TIERS.TIER_4.min) return 4;
    if (amount >= INVESTMENT_TIERS.TIER_3.min) return 3;
    if (amount >= INVESTMENT_TIERS.TIER_2.min) return 2;
    return 1;
  }
// >>> Get tier name for display purposes
  static getTierName(tier: number): string {
    const names = {
      1: "Tier 1",
      2: "Tier 2",
      3: "Tier 3",
      4: "Tier 4"
    };
    return names[tier as keyof typeof names] || "Unbekannt";
  }
// >>> Get tier description for help text
  static getTierDescription(tier: number): string {
    const descriptions = {
      1: "1-100 credits (Bessere Seltene-Event-Chancen)",
      2: "101-500 credits (Epische Events + sehr seltene 2. Event-Chance)", 
      3: "501-1500 credits (Epische Events + seltene 2. Event-Chance)",
      4: "1501+ credits (Legendäre Events + minimale 2. Event-Chance)"
    };
    return descriptions[tier as keyof typeof descriptions] || "Unbekannt";
  }
// >>> Filter events available for a specific tier
  static getAvailableEvents(tier: number): TieredExplorationEvent[] {
    return TIERED_EXPLORATION_EVENTS.filter(event => event.minTier <= tier);
  }

  // >>> Calculate probability weights for different rarities based on tier
  // >>> Select a random event based on tier and rarity weights
  static getRarityWeights(tier: number): Record<string, number> {
    const weights = {
      1: { common: 85, rare: 15, epic: 0, legendary: 0 },        // <<< Mostly common
      2: { common: 60, rare: 35, epic: 5, legendary: 0 },        // <<< Some rare
      3: { common: 35, rare: 40, epic: 22, legendary: 3 },       // <<< Good epic chance
      4: { common: 20, rare: 30, epic: 35, legendary: 15 }       // <<< High legendary chance
    };
    return weights[tier as keyof typeof weights] || weights[1];
  }


   // >>> Select a random event based on tier and rarity weights
  static selectEvent(tier: number): TieredExplorationEvent {
    const availableEvents = this.getAvailableEvents(tier);
    const weights = this.getRarityWeights(tier);
    
    // >>> Create weighted event pool
    const weightedEvents: TieredExplorationEvent[] = [];
    
    availableEvents.forEach(event => {
      const weight = weights[event.rarity] || 0;
      for (let i = 0; i < weight; i++) {
        weightedEvents.push(event);
      }
    });
    
    if (weightedEvents.length === 0) {
      // >>> Fallback to tier 1 events if nothing available
      return this.selectEvent(1);
    }
    
    return weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
  }

  // >>> Higher investment = better rarity chances + multiple events + bonus events
  static scaleEventEffects(event: TieredExplorationEvent, tier: number, investmentAmount: number): GameEvent {
    
    const scaledEvent: GameEvent = {
      emoji: event.emoji,
      text: event.text,
      credits: event.credits,
      damage: event.damage,
      fuel: event.fuel,
      addCargo: event.addCargo,
      removeCargo: event.removeCargo
    };
    
    return scaledEvent;
  }

  //>>> Higher investment = better rarity chances + MINIMAL chance for bonus events
  static generateMultipleExplorationResults(investmentAmount: number): ExplorationResult[] {
    const tier = this.getInvestmentTier(investmentAmount);
    const results: ExplorationResult[] = [];
    
    // >>> Base: Always 1 event
    const baseEvents = 1;
    let numEvents = baseEvents;
    
    // >>> VERY RARE chance for bonus events - only at high investment levels
    const tierRange = this.getTierRange(tier);
    const investmentRatio = (investmentAmount - tierRange.min) / Math.max(1, (tierRange.max === Infinity ? 1500 : tierRange.max) - tierRange.min);
    
    // >>> Much lower bonus event chances - only for very high investments
    const bonusEventChance = Math.min(0.15, investmentRatio * 0.1); // <<< Max 15% chance, starts very low
    
    // >>> Roll for ONE potential bonus event (max 2 events total)
    if (Math.random() < bonusEventChance && investmentRatio > 0.8) { // <<< Only if investing in top 20% of tier
      numEvents = 2; // <<< Max 2 events total
    }
    
    // >>> Generate each event with improved rarity weights based on investment
    for (let i = 0; i < numEvents; i++) {
      const adjustedWeights = this.getInvestmentAdjustedRarityWeights(tier, investmentAmount);
      const event = this.selectEventWithWeights(tier, adjustedWeights);
      const scaledEvent = this.scaleEventEffects(event, tier, investmentAmount);
      
      results.push({
        event,
        tier,
        investmentAmount,
        scaledEvent
      });
    }
    
    return results;
  }
// >>> Get rarity weights adjusted by investment amount within tier
  static getInvestmentAdjustedRarityWeights(tier: number, investmentAmount: number): Record<string, number> {
    const baseWeights = this.getRarityWeights(tier);
    const tierRange = this.getTierRange(tier);
    const investmentRatio = Math.min(1.0, (investmentAmount - tierRange.min) / Math.max(1, (tierRange.max === Infinity ? 1500 : tierRange.max) - tierRange.min));
    
    // >>> Higher investment shifts probability toward rarer events
    const rarityBoost = investmentRatio * 0.5; // <<< Up to 50% boost to rare event chances

    return {
      common: Math.max(10, baseWeights.common - (rarityBoost * 30)),
      rare: baseWeights.rare + (rarityBoost * 15),
      epic: baseWeights.epic + (rarityBoost * 10),
      legendary: baseWeights.legendary + (rarityBoost * 5)
    };
  }
// >>> Select event with custom weights
  static selectEventWithWeights(tier: number, weights: Record<string, number>): TieredExplorationEvent {
    const availableEvents = this.getAvailableEvents(tier);
    
    // >>> Create weighted event pool
    const weightedEvents: TieredExplorationEvent[] = [];
    
    availableEvents.forEach(event => {
      const weight = weights[event.rarity] || 0;
      for (let i = 0; i < weight; i++) {
        weightedEvents.push(event);
      }
    });
    
    if (weightedEvents.length === 0) {
      return this.selectEvent(1);
    }
    
    return weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
  }
// >>> Get the range for a specific tier
  static getTierRange(tier: number): { min: number; max: number } {
    const ranges = {
      1: INVESTMENT_TIERS.TIER_1,
      2: INVESTMENT_TIERS.TIER_2,
      3: INVESTMENT_TIERS.TIER_3,
      4: INVESTMENT_TIERS.TIER_4
    };
    return ranges[tier as keyof typeof ranges] || ranges[1];
  }
// >>> Get flavor text for an event based on tier
  static getFlavorText(event: TieredExplorationEvent, tier: number): string {
    return event.flavorText[tier as keyof typeof event.flavorText] || 
           event.flavorText[1] || 
           "Du beginnst deine Erkundungsmission...";
  }
// >>> Generate complete exploration result
  static generateExplorationResult(investmentAmount: number): ExplorationResult {
    const tier = this.getInvestmentTier(investmentAmount);
    const event = this.selectEvent(tier);
    const scaledEvent = this.scaleEventEffects(event, tier, investmentAmount);
    
    return {
      event,
      tier,
      investmentAmount,
      scaledEvent
    };
  }
// >>> Format exploration result for display
static formatExplorationResult(result: ExplorationResult): string {
    const { tier, investmentAmount, scaledEvent } = result;
    const tierName = this.getTierName(tier);
    
    let message = `[${tierName}] ${investmentAmount} credits : ${scaledEvent.emoji} ${scaledEvent.text}`;
    
    // >>> Effekte kurz anzeigen
    const effects: string[] = [];
    if (scaledEvent.credits) {
        effects.push(`${scaledEvent.credits > 0 ? '+' : ''}${scaledEvent.credits} credits `);
    }
    if (scaledEvent.damage) {
        effects.push(`${scaledEvent.damage > 0 ? '+' : ''}${scaledEvent.damage}% Schaden`);
    }
    if (scaledEvent.fuel) {
        effects.push(`${scaledEvent.fuel > 0 ? '+' : ''}${scaledEvent.fuel}% Treibstoff`);
    }
    if (scaledEvent.addCargo) {
        effects.push(`+${scaledEvent.addCargo.quantity}x ${scaledEvent.addCargo.item}`);
    }
    if (scaledEvent.removeCargo) {
        effects.push('Fracht verloren');
    }
    
    if (effects.length > 0) {
        message += ` (${effects.join(', ')})`;
    }
    
    return message;
}
// >>> Validate investment amount
  static validateInvestment(amount: number, playerCredits: number): string | null {
    if (amount <= 0) {
      return "Investitionsbetrag muss positiv sein!";
    }
    if (amount > playerCredits) {
      return `Du hast nicht genug credits! (${playerCredits} verfügbar)`;
    }
    if (!Number.isInteger(amount)) {
      return "Investitionsbetrag muss eine ganze Zahl sein!";
    }
    return null;
  }
// >>> Check if an interactive event should trigger (15% chance)
  static shouldTriggerInteractiveEvent(): boolean {
    return Math.random() < 0.15; // >>> 15% chance
  }
// >>> Get a random interactive event
  static getRandomInteractiveEvent(): InteractiveEvent {
    return INTERACTIVE_EVENTS[Math.floor(Math.random() * INTERACTIVE_EVENTS.length)];
  }
// >>> Generate exploration result that might include an interactive event + multiple events
  static generateExplorationResultWithInteractive(investmentAmount: number): (ExplorationResult & { interactiveEvent?: InteractiveEvent })[] {
    const results = this.generateMultipleExplorationResults(investmentAmount);
    
    // >>> Check if we should trigger an interactive event (only once per exploration)
    if (this.shouldTriggerInteractiveEvent()) {
      const interactiveEvent = this.getRandomInteractiveEvent();
      // >>> Add interactive event to the first result
      if (results.length > 0) {
        (results[0] as any).interactiveEvent = interactiveEvent;
      }
    }
    
    return results;
  }
// >>> Format multiple exploration results for display
  static formatMultipleExplorationResults(results: ExplorationResult[]): string {
    if (results.length === 1) {
      return this.formatExplorationResult(results[0]);
    }
    
    const { tier, investmentAmount } = results[0];
    const tierName = this.getTierName(tier);
    
    let message = `[${tierName}] ${investmentAmount} credits - ${results.length} Events:\n`;
    
    results.forEach((result, index) => {
      const effects: string[] = [];
      const { scaledEvent } = result;
      
      if (scaledEvent.credits) {
        effects.push(`${scaledEvent.credits > 0 ? '+' : ''}${scaledEvent.credits} credits`);
      }
      if (scaledEvent.damage) {
        effects.push(`${scaledEvent.damage > 0 ? '+' : ''}${scaledEvent.damage}% Schaden`);
      }
      if (scaledEvent.fuel) {
        effects.push(`${scaledEvent.fuel > 0 ? '+' : ''}${scaledEvent.fuel}% Treibstoff`);
      }
      if (scaledEvent.addCargo) {
        effects.push(`+${scaledEvent.addCargo.quantity}x ${scaledEvent.addCargo.item}`);
      }
      if (scaledEvent.removeCargo) {
        effects.push('Fracht verloren');
      }
      
      const effectsStr = effects.length > 0 ? ` (${effects.join(', ')})` : '';
      message += `${index + 1}. ${scaledEvent.emoji} ${scaledEvent.text}${effectsStr}\n`;
    });
    
    return message.trim();
  }
}

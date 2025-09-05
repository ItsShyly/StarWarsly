// ^^^ Interactive Event Manager - Time-Limited Challenges ^^^

// >>> Manages time-sensitive interactive events that require quick player responses.
// >>> Handles event lifecycles, command matching, and automatic cleanup.

import type { InteractiveEvent, PendingInteractiveEvent, InteractiveEventResult } from "../commands/starship/types.js";
import { 
  scaleInteractiveEventResult, 
  getInvestmentTier, 
  shouldTriggerRareEvent, 
  getCommandType, 
  getSuccessRate 
} from "../commands/starship/constants.js";
// vvv Interactive Event System vvv
// >>> Global storage for pending interactive events
// >>> In production, this should be persisted to a database
export class InteractiveEventManager {
  private static pendingEvents: Map<string, PendingInteractiveEvent> = new Map();
  
  // vvv Event Key Generation vvv
  // >>> Create a unique key for a user in a channel
  private static createKey(userId: string, channelId: string): string {
    return `${userId}:${channelId}`;
  }

  // vvv Event Initialization vvv
  // >>> Start an interactive event for a user
  static startEvent(event: InteractiveEvent, userId: string, channelId: string, timeoutCallback?: () => void, investmentAmount?: number): void {
    const key = this.createKey(userId, channelId);
    
    const pendingEvent: PendingInteractiveEvent = {
      event,
      userId,
      channelId,
      startTime: Date.now(),
      timeoutCallback,
      investmentAmount
    };

    this.pendingEvents.set(key, pendingEvent);

    // vvv Timeout Handler vvv
    // >>> Handle event timeout with notification
    setTimeout(() => {
      const existingEvent = this.pendingEvents.get(key);
      if (existingEvent) {
        // >>> Event timed out - call timeout callback if provided
        if (existingEvent.timeoutCallback) {
          existingEvent.timeoutCallback();
        }
        this.pendingEvents.delete(key);
      }
    }, event.timeLimit * 1000);
    
    // vvv Final Cleanup Timer vvv
    // >>> Auto-cleanup after time limit + 10 seconds buffer for any stragglers
    setTimeout(() => {
      this.pendingEvents.delete(key);
    }, (event.timeLimit + 10) * 1000);
  }
  
  // vvv Event Status Check vvv
  // >>> Check if a user has a pending interactive event
  static hasPendingEvent(userId: string, channelId: string): boolean {
    const key = this.createKey(userId, channelId);
    const pending = this.pendingEvents.get(key);
    
    if (!pending) return false;

    // vvv Expiration Validation vvv
    // >>> Check if event has expired
    const elapsed = (Date.now() - pending.startTime) / 1000;
    if (elapsed > pending.event.timeLimit) {
      this.pendingEvents.delete(key);
      return false;
    }

    return true;
  }

  // vvv Event Retrieval vvv
  // >>> Get pending event for a user
  static getPendingEvent(userId: string, channelId: string): PendingInteractiveEvent | null {
    const key = this.createKey(userId, channelId);
    const pending = this.pendingEvents.get(key);
    
    if (!pending) return null;

    // >>> Check if event has expired
    const elapsed = (Date.now() - pending.startTime) / 1000;
    if (elapsed > pending.event.timeLimit) {
      this.pendingEvents.delete(key);
      return null;
    }

    return pending;
  }

  // vvv Command Response Handler with Good/Risky Choice System vvv
  // >>> Handle a command that might be a response to an interactive event
  static handleCommand(command: string, userId: string, channelId: string): { result: InteractiveEventResult, investmentAmount?: number, eventType?: 'SUCCESS' | 'FAILURE' } | null {
    const pending = this.getPendingEvent(userId, channelId);
    if (!pending) return null;

    const { event, investmentAmount } = pending;
    const normalizedCommand = command.toLowerCase();

    // vvv Success Command Matching vvv
    // >>> Check if command matches success criteria
    const successCommands = Array.isArray(event.successCommand) 
      ? event.successCommand 
      : [event.successCommand];

    const isSuccessCommand = successCommands.some(cmd => cmd.toLowerCase() === normalizedCommand);

    // vvv Event Resolution vvv
    // >>> Remove the pending event
    this.pendingEvents.delete(this.createKey(userId, channelId));

    let baseResult: InteractiveEventResult;
    let eventType: 'SUCCESS' | 'FAILURE' = 'FAILURE';

    if (isSuccessCommand) {
      // >>> Determine success based on command type and success rates
      const commandType = getCommandType(normalizedCommand);
      const successRate = getSuccessRate(normalizedCommand);
      const randomRoll = Math.random();
      
      console.log(`🎲 Interactive Choice: Command=${normalizedCommand}, Type=${commandType}, SuccessRate=${successRate}, Roll=${randomRoll.toFixed(3)}`);
      
      if (randomRoll < successRate) {
        // >>> Success!
        eventType = 'SUCCESS';
        if (typeof event.successResult === 'object' && !Array.isArray(event.successResult) && !('text' in event.successResult)) {
          // >>> Multiple success results based on command choice
          const result = event.successResult[normalizedCommand] || event.successResult[successCommands[0]];
          baseResult = result || event.failureResult;
        } else {
          // >>> Single success result
          baseResult = event.successResult as InteractiveEventResult;
        }
      } else {
        // >>> Failed the roll - use failure result
        baseResult = event.failureResult;
      }
    } else {
      // >>> Command didn't match any success command
      baseResult = event.failureResult;
    }

    // >>> Apply scaling if investment amount is available
    if (investmentAmount && investmentAmount > 0) {
      const tier = getInvestmentTier(investmentAmount);
      const isRareEvent = shouldTriggerRareEvent(eventType);
      const scaledResult = scaleInteractiveEventResult(baseResult, investmentAmount, tier, eventType, isRareEvent);
      return { result: scaledResult, investmentAmount, eventType };
    }

    return { result: baseResult, investmentAmount, eventType };
  }

  // vvv Expired Event Cleanup vvv
  // >>> Clean up expired events (called periodically)
  static cleanupExpiredEvents(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, pending] of this.pendingEvents) {
      const elapsed = (now - pending.startTime) / 1000;
      if (elapsed > pending.event.timeLimit) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.pendingEvents.delete(key));
  }
  
  // vvv Timer Status vvv
  // >>> Get time remaining for an interactive event
  static getTimeRemaining(userId: string, channelId: string): number {
    const pending = this.getPendingEvent(userId, channelId);
    if (!pending) return 0;

    const elapsed = (Date.now() - pending.startTime) / 1000;
    return Math.max(0, pending.event.timeLimit - elapsed);
  }
  
  // vvv Debug Functions vvv
  // >>> Clear all pending events (for testing/debugging)
  static clearAll(): void {
    this.pendingEvents.clear();
  }
  
  // >>> Get count of pending events (for debugging)
  static getPendingCount(): number {
    return this.pendingEvents.size;
  }
}

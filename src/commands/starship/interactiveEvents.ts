// ^^^ Interactive Event Manager - Time-Limited Challenges ^^^

// >>> Manages time-sensitive interactive events that require quick player responses.
// >>> Handles event lifecycles, command matching, and automatic cleanup.
// >>> Creates engaging real-time gameplay moments with risk/reward mechanics.

import type { InteractiveEvent, PendingInteractiveEvent, InteractiveEventResult } from "./types.js";

// vvv Interactive Event System vvv
// >>> Global storage for pending interactive events
// >>> In production, this should be persisted to a database
export class InteractiveEventManager {
  private static pendingEvents: Map<string, PendingInteractiveEvent> = new Map();
  
  // ^^^ Event Key Generation ^^^
  // >>> Create a unique key for a user in a channel
  private static createKey(userId: string, channelId: string): string {
    return `${userId}:${channelId}`;
  }
  
  // ^^^ Event Initialization ^^^
  // >>> Start an interactive event for a user
  static startEvent(event: InteractiveEvent, userId: string, channelId: string): void {
    const key = this.createKey(userId, channelId);
    
    const pendingEvent: PendingInteractiveEvent = {
      event,
      userId,
      channelId,
      startTime: Date.now()
    };

    this.pendingEvents.set(key, pendingEvent);

    // vvv Auto-Cleanup Timer vvv
    // >>> Auto-cleanup after time limit + 5 seconds buffer
    setTimeout(() => {
      this.pendingEvents.delete(key);
    }, (event.timeLimit + 5) * 1000); // <<< Extra buffer for network latency
  }
  
  // ^^^ Event Status Check ^^^
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
  
  // ^^^ Event Retrieval ^^^
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
  
  // ^^^ Command Response Handler ^^^
  // >>> Handle a command that might be a response to an interactive event
  static handleCommand(command: string, userId: string, channelId: string): InteractiveEventResult | null {
    const pending = this.getPendingEvent(userId, channelId);
    if (!pending) return null;

    const { event } = pending;
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

    if (isSuccessCommand) {
      // >>> Handle success result
      if (typeof event.successResult === 'object' && !Array.isArray(event.successResult) && !('text' in event.successResult)) {
        // >>> Multiple success results based on command choice
        const result = event.successResult[normalizedCommand] || event.successResult[successCommands[0]];
        return result || event.failureResult;
      } else {
        // >>> Single success result
        return event.successResult as InteractiveEventResult;
      }
    }

    // >>> Command didn't match, return failure result
    return event.failureResult;
  }
  
  // ^^^ Expired Event Cleanup ^^^
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
  
  // ^^^ Timer Status ^^^
  // >>> Get time remaining for an interactive event
  static getTimeRemaining(userId: string, channelId: string): number {
    const pending = this.getPendingEvent(userId, channelId);
    if (!pending) return 0;

    const elapsed = (Date.now() - pending.startTime) / 1000;
    return Math.max(0, pending.event.timeLimit - elapsed);
  }
  
  // ^^^ Debug Functions ^^^
  // >>> Clear all pending events (for testing/debugging)
  static clearAll(): void {
    this.pendingEvents.clear();
  }
  
  // >>> Get count of pending events (for debugging)
  static getPendingCount(): number {
    return this.pendingEvents.size;
  }
}

// ^^^ Player Context Manager - Activity State Tracking ^^^

// >>> Manages what activity or game mode each player is currently engaged in.
// >>> Allows commands to behave differently based on context (starship, war, etc.).
// >>> Provides context switching and state management for multi-mode gameplay.

import { GlobalDatabase } from '../database/GlobalDatabase.js';

const globalDB = GlobalDatabase.getInstance();

export type GameContext = 'starship' | 'war' | 'trade' | 'idle';

export interface ContextState {
  context: GameContext;
  data: any;
  startedAt: number;
}

export class PlayerContextManager {
  private static contextStates: Map<string, ContextState> = new Map();
  
  // vvv Context Management vvv
  // >>> Set a player's current context
  static async setContext(username: string, context: GameContext, data: any = {}): Promise<void> {
    const key = username.toLowerCase();
    
    const state: ContextState = {
      context,
      data,
      startedAt: Date.now()
    };
    
    this.contextStates.set(key, state);
    
    // >>> Also update in database for persistence
    const player = await globalDB.getPlayer(username);
    player.currentContext = context;
    player.contextData = data;
    await globalDB.savePlayer(player);
  }
  
  // >>> Get a player's current context
  static async getContext(username: string): Promise<ContextState> {
    const key = username.toLowerCase();
    
    // >>> Check memory cache first
    if (this.contextStates.has(key)) {
      return this.contextStates.get(key)!;
    }
    
    // >>> Fall back to database
    const player = await globalDB.getPlayer(username);
    const state: ContextState = {
      context: (player.currentContext as GameContext) || 'idle',
      data: player.contextData || {},
      startedAt: Date.now()
    };
    
    this.contextStates.set(key, state);
    return state;
  }
  
  // >>> Check if player is in a specific context
  static async isInContext(username: string, context: GameContext): Promise<boolean> {
    const state = await this.getContext(username);
    return state.context === context;
  }
  
  // >>> Clear a player's context (return to idle)
  static async clearContext(username: string): Promise<void> {
    const key = username.toLowerCase();
    this.contextStates.delete(key);
    const player = await globalDB.getPlayer(username);
    player.currentContext = 'idle';
    player.contextData = {};
    await globalDB.savePlayer(player);
  }
  
  // >>> Get all players in a specific context
  static getPlayersInContext(context: GameContext): string[] {
    const players: string[] = [];
    for (const [username, state] of this.contextStates) {
      if (state.context === context) {
        players.push(username);
      }
    }
    return players;
  }
  
  // vvv Context Utilities vvv
  // >>> Check if context has expired (e.g., for time-limited activities)
  static isContextExpired(state: ContextState, maxDurationMs: number): boolean {
    return Date.now() - state.startedAt > maxDurationMs;
  }
  
  // >>> Clean up expired contexts
  static async cleanupExpiredContexts(maxIdleMs: number = 30 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const toRemove: string[] = [];
    
    for (const [username, state] of this.contextStates) {
      if (state.context !== 'idle' && now - state.startedAt > maxIdleMs) {
        toRemove.push(username);
      }
    }
    
    for (const username of toRemove) {
      await this.clearContext(username);
    }
  }
  
  // >>> Get context-specific message prefix
  static getContextPrefix(context: GameContext): string {
    const prefixes = {
      starship: '🚀',
      war: '⚔️',
      trade: '💰',
      idle: '💤'
    };
    return prefixes[context] || '';
  }
  
  // >>> Format context for display
  static formatContext(state: ContextState): string {
    const prefix = this.getContextPrefix(state.context);
    const names = {
      starship: 'Raumschiff-Modus',
      war: 'Kriegs-Modus',
      trade: 'Handels-Modus',
      idle: 'Inaktiv'
    };
    return `${prefix} ${names[state.context] || state.context}`;
  }
}

// ^^^ Starship Types - Data Structure Definitions ^^^
// vvv Core Data Structures for Starship Adventure System vvv

// >>> Defines all TypeScript interfaces for the starship adventure system.
// >>> Includes ship state, game events, cargo systems, and database schemas.
// >>> Ensures type safety across the entire starship module.

export interface PlanetCoords {
  x: number;
  y: number;
  z: number;
}

// >>> Main starship interface representing player's ship state
export interface Starship {
  name: string;
  baseSpeed: number;
  currentSpeed: number;
  fuel: number;
  credits: number;
  damage: number;
  cargo: { item: string; quantity: number }[];
  location: string;
  distance: number;
  lastFlightDate?: string;
  inFlight?: {
    destination: string;
    departureTime: number;
    arrivalTime: number;
    distance: number;
    baseArrivalTime: number;
    channel: string;
  };
  canLand: boolean;
  exploreCount: number;
  hasLanded: boolean;
  hasExploredThisLanding: boolean;
  lastItemUpdate?: number;
}

// >>> Base game event interface for random encounters
export interface GameEvent {
  text: string;
  emoji: string;
  damage?: number;
  fuel?: number;
  credits?: number;
  addCargo?: { item: string; quantity: number };
  removeCargo?: boolean;
}

// >>> Extended event interface with rarity tiers and tier-specific content
export interface TieredExplorationEvent extends GameEvent {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  minTier: 1 | 2 | 3 | 4;
  flavorText: {
    1?: string;
    2?: string;
    3?: string;
    4?: string;
  };
}

// >>> Result structure for exploration activities
export interface ExplorationResult {
  event: TieredExplorationEvent;
  tier: number;
  investmentAmount: number;
  scaledEvent: GameEvent;
}

// >>> Result structure for interactive events
export interface InteractiveEventResult {
  text: string;
  emoji: string;
  damage?: number;
  fuel?: number;
  credits?: number;
  addCargo?: { item: string; quantity: number };
  removeCargo?: boolean;
}

// >>> Interactive event definition with time-limited challenges
export interface InteractiveEvent {
  id: string;
  emoji: string;
  text: string;
  timeLimit: number;
  successCommand: string | string[];
  successResult: InteractiveEventResult | Record<string, InteractiveEventResult>;
  failureResult: InteractiveEventResult;
}

// >>> Tracking structure for pending interactive events
export interface PendingInteractiveEvent {
  event: InteractiveEvent;
  userId: string;
  channelId: string;
  startTime: number;
  messageId?: string;
}

// >>> Cargo type definition with optional functional properties
export interface CargoType {
  weight: number;
  value: number;
  functional?: {
    type: 'fuel_generator' | 'credit_generator' | 'speed_booster' | 'repair_droid';
    effect: number;
    duration?: number;
  };
}

// >>> Database row structure for starship persistence
export interface StarshipRow {
  user: string;
  name: string;
  baseSpeed: number;
  currentSpeed: number;
  fuel: number;
  credits: number;
  damage: number;
  cargo: string;
  location: string;
  distance: number;
  lastFlightDate?: string;
  inFlight?: string;
  canLand?: number;
  exploreCount?: number;
  hasLanded?: number;
  hasExploredThisLanding?: number;
  lastItemUpdate?: number;
}
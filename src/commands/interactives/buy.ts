// ^^^ Buy Command - Universal Purchase Action ^^^

// >>> Global purchase command that works across all game contexts.
// >>> Handles buying items, ships, upgrades, or services based on player's current activity.
// >>> Provides context-aware purchasing with shared credit system.

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "buy",
  description: "Buy items, upgrades, or services in your current context",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("buy", context);
  },
};

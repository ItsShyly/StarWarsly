// ^^^ Inspect Command - Universal Investigation Action ^^^

// >>> Global inspection command that works across all game contexts.
// >>> Examine objects, locations, or situations in detail.
// >>> Provides context-aware information gathering.

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "inspect",
  description: "Examine something closely in your current context",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("inspect", context);
  },
};

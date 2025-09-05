// ^^^ Fight Command - Universal Combat Action ^^^

// >>> Global combat command that works across all game contexts.
// >>> Engage in battle, defend yourself, or attack enemies.
// >>> Provides context-aware combat mechanics.

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "fight",
  description: "Engage in combat or defend yourself",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("fight", context);
  },
};

// ^^^ Run Command - Universal Escape Action ^^^

// >>> Global escape command that works across all game contexts.
// >>> Flee from danger, retreat from combat, or quickly exit situations.
// >>> Provides context-aware evasion mechanics.

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "run",
  description: "Flee from danger or retreat from your current situation",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("run", context);
  },
};

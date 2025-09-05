// ^^^ Retreat Command - Universal Tactical Withdrawal ^^^

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "retreat",
  description: "Make a tactical withdrawal from combat or danger",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("retreat", context);
  },
};

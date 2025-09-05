// ^^^ Fly Command - Universal Movement Action ^^^

import type { BotCommandContext } from "../../types/index.js";
import { GlobalInteractiveHandler } from "../../utils/globalInteractiveHandler.js";

export default {
  name: "fly",
  description: "fly up or over obstacles to reach your goal",
  defaultModOnly: false,
  globalCooldown: 3,
  execute: async (params: string[], context: BotCommandContext) => {
    await GlobalInteractiveHandler.handleInteractiveCommand("fly", context);
  },
};
